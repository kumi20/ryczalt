import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
  ChangeDetectorRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from "devextreme-angular";
import { EventService } from "../../services/event-services.service";
import { ZusService } from "../../services/zus.service";
import DataSource from "devextreme/data/data_source";
import { ConfirmDialogComponent } from "../core/confirm-dialog/confirm-dialog.component";
import { NgShortcutsComponent } from "../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component";
import { AllowIn, ShortcutInput } from "ng-keyboard-shortcuts";
import { PriceFormatPipe } from "../../pipes/price-format.pipe";
import { ContributionsZUS } from "../../interface/zus";
import { AddZusComponent } from "./add-zus/add-zus.component";
import { DateRangeComponent } from "../date-range/date-range.component";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import {
  GenericGridColumn,
  GenericGridOptions,
} from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";

/**
 * @fileoverview ZusComponent manages ZUS (Social Insurance) contribution records.
 * @description This component provides a comprehensive interface for managing ZUS social insurance
 * contributions including health insurance, social insurance, and labor fund contributions.
 * It supports viewing, adding, editing, and deleting contribution records with responsive design.
 *
 * @component
 * @example
 * ```html
 * <app-zus></app-zus>
 * ```
 *
 * @dependencies
 * - EventService: For global event handling and session management
 * - ZusService: For ZUS contribution CRUD operations
 * - TranslateService: For internationalization support
 *
 * @features
 * - ZUS contribution records management (CRUD operations)
 * - Health insurance, social insurance, and labor fund tracking
 * - Generic data grid with responsive design
 * - Keyboard shortcuts for efficient navigation
 * - Date range filtering by month and year
 * - Mobile-responsive data display
 * - Automatic contribution totals calculation
 * - Confirm dialogs for safe operations
 *
 * @author Angular Team
 * @since 1.0.0
 */
@Component({
  selector: "app-zus",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    DxScrollViewModule,
    DxTooltipModule,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    PriceFormatPipe,
    AddZusComponent,
    DateRangeComponent,
    GenericDataGridComponent,
  ],
  templateUrl: "./zus.component.html",
  styleUrls: ["./zus.component.scss"],
})
export class ZusComponent implements OnInit, OnDestroy {
  @ViewChild("genericDataGrid") genericDataGrid: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  zusService = inject(ZusService);
  cdr = inject(ChangeDetectorRef);
  Number = Number;
  private deviceTypeSubscription?: Subscription;

  dataSource: any;
  focusedRowIndex = 0;
  pageSize = 20;
  heightGrid = "calc(100vh - 105px)";
  shortcuts: ShortcutInput[] = [];

  isDelete = signal<boolean>(false);
  isAdd = signal<boolean>(false);
  mode: "add" | "edit" | "show" = "add";
  focusedElement = signal<any>(null);
  month = signal<number>(new Date().getMonth() + 1);
  year = signal<number>(new Date().getFullYear());
  isClosed = signal<boolean>(false);

  /** Opcje siatki klientów */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 105px)",
        columnHidingEnabled: true,
        columnChooser: {
          enabled: true,
          mode: 'select',
          searchEnabled: true,
          sortOrder: 'asc',
        },
      } as GenericGridOptions)
  );

  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant("zus.periodFrom"),
          dataField: "month",
          width: 110,
          minWidth: 90,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
          cellTemplate: (e: any) => {
            return (
              e.data.year +
              "-" +
              e.data.month.toString().padStart(2, "0") +
              "-01"
            );
          },
        },
        {
          caption: this.translate.instant("zus.periodTo"),
          dataField: "year",
          width: 110,
          minWidth: 90,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
          cellTemplate: (e: any) => {
            return (
              e.data.year +
              "-" +
              e.data.month.toString().padStart(2, "0") +
              "-" +
              this.getLastDayOfMonth(e.data.year, e.data.month)
            );
          },
        },
        {
          caption: this.translate.instant("zus.healthInsurance"),
          dataField: "contributionHealth",
          width: 250,
          minWidth: 120,
          hidingPriority: 4,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.socialInsurance"),
          dataField: "social",
          width: 250,
          minWidth: 120,
          hidingPriority: 5,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.laborFund"),
          dataField: "fpfgsw",
          width: 250,
          minWidth: 120,
          hidingPriority: 6,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.totalZus"),
          dataField: "isContributionHolidays",
          width: 250,
          minWidth: 120,
          hidingPriority: 2, // Wysoki priorytet
          cellTemplate: (e: any) => {
            return this.event.formatKwota({
              value:
                Number(e.data.contributionHealth || 0) +
                Number(e.data.social || 0) +
                Number(e.data.fpfgsw || 0),
            });
          },
        },
      ] as GenericGridColumn[]
  );

  /**
   * Initializes the component by setting up shortcuts, loading data, and device type subscription.
   * Called once after component initialization.
   * @lifecycle OnInit
   */
  ngOnInit(): void {
    this.initShortcuts();
    this.getData();
    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  /**
   * Initializes keyboard shortcuts for ZUS operations.
   * Sets up shortcuts for adding (Alt+N), editing (F2), viewing (Shift+F2), and deleting (Del).
   * @private
   */
  initShortcuts() {
    this.shortcuts.push(
      {
        key: ["alt + n"],
        label: "Add",
        description: "Add new ZUS entry",
        command: () => this.addNewRecord(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      },
      {
        key: ["f2"],
        label: "Edit",
        description: "Edit ZUS entry",
        command: () => this.onEdit(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      },
      {
        key: ["shift + f2"],
        label: "Show",
        description: "Show ZUS entry",
        command: () => this.onShow(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      },
      {
        key: ["del"],
        label: "Delete",
        description: "Delete ZUS entry",
        command: () => this.onDeleteConfirm(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      }
    );
  }

  /**
   * Initializes and configures the data source for ZUS contribution records.
   * Sets up the AspNetData store with appropriate endpoints and event handlers.
   * Automatically focuses on the first row after data loading.
   * @private
   */
  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: "contributionsZUSId",
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}zus/contributions`,
        loadParams: this.getLoadParams(),
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        onLoaded: (data) => {
          if (data.length > 0) this.focusedElement.set(data[0]);
          else this.focusedElement.set(null);
          setTimeout(() => {
            this.genericDataGrid.focus();
          }, 0);
        },
      }),
    });
  }

  /**
   * Constructs the load parameters for the ZUS data source.
   * Currently includes the global year from the event service.
   * @returns An object containing the load parameters
   * @private
   */
  getLoadParams() {
    let obj: any = {};
    obj.year = this.event.globalDate.year;
    return obj;
  }

  /**
   * Handles date range changes from the date range component.
   * Updates the month and year signals and refreshes the data grid.
   * @param event - The date range change event
   * @param event.month - The selected month (1-12)
   * @param event.year - The selected year
   * @public
   */
  onDateRangeChange(event: { month: number; year: number }) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }

  /**
   * Handles data grid row focus changes.
   * Updates the focused element signal with the selected row data.
   * @param e - The row focus change event containing row data
   * @public
   */
  onFocusedRowChanged(e: any) {
    this.focusedElement.set(e.row.data);
  }

  /**
   * Initiates the process of adding a new ZUS contribution record.
   * Validates session activity and month closure status before proceeding.
   * @public
   */
  addNewRecord() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.mode = "add";
    this.isAdd.set(true);
  }

  /**
   * Initiates the process of editing the currently focused ZUS contribution record.
   * Validates session activity before proceeding.
   * @public
   */
  onEdit() {
    if (!this.event.sessionData.isActive) return;
    this.mode = "edit";
    this.isAdd.set(true);
  }

  /**
   * Initiates the process of viewing the currently focused ZUS contribution record in read-only mode.
   * @public
   */
  onShow() {
    this.mode = "show";
    this.isAdd.set(true);
  }

  /**
   * Shows the delete confirmation dialog for the currently focused ZUS contribution record.
   * Only proceeds if the user session is active.
   * @public
   */
  onDeleteConfirm() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(true);
  }

  /**
   * Deletes the currently focused ZUS contribution record.
   * Validates session activity and record existence before proceeding.
   * Refreshes the data grid after successful deletion.
   * @public
   */
  delete() {
    if (!this.event.sessionData.isActive) return;

    const id = this.focusedElement()?.contributionsZUSId;
    if (!id) return;

    this.zusService.delete(id).subscribe({
      next: () => {
        this.getData();
        this.isDelete.set(false);
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  /**
   * Closes the delete confirmation dialog and returns focus to the data grid.
   * @public
   */
  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Handles the saving event from the add/edit dialog.
   * Reloads the data source and focuses on the saved record.
   * @param event - The save event containing the record ID
   * @param event.id - The ID of the saved ZUS contribution record
   * @public
   */
  onSaving(event: any) {
    this.dataSource.reload().then((data: ContributionsZUS[]) => {
      const index = data.findIndex(
        (x: any) => x.contributionsZUSId == event.id
      );

      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
    });
    this.isAdd.set(false);
  }

  /**
   * Calculates the last day of a given month and year.
   * @param year - The year (4-digit)
   * @param month - The month (1-12)
   * @returns The last day of the month (28-31)
   * @example
   * ```typescript
   * const lastDay = this.getLastDayOfMonth(2024, 2); // returns 29 (leap year)
   * ```
   */
  getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Handles double-click events on data grid rows.
   * Triggers the edit action for the double-clicked row.
   * @param event - The double-click event
   * @public
   */
  onRowDblClick(event: any) {
    this.onEdit();
  }

  /**
   * Handles the closing event from dialogs.
   * Hides the add/edit dialog and returns focus to the data grid.
   * @public
   */
  onClosing() {
    this.isAdd.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Retrieves data items for mobile view rendering.
   * Safely accesses the data source items with fallback to empty array.
   * @returns Array of ZUS contribution data items for mobile display
   * @public
   */
  getMobileDataItems(): any[] {
    if (this.dataSource && this.dataSource.items) {
      return this.dataSource.items() || [];
    }
    return [];
  }

  /**
   * Handles click events on mobile ZUS contribution items.
   * Updates the focused element and row index, then triggers row focus change.
   * @param item - The clicked ZUS contribution data item
   * @param index - The index of the clicked item
   * @public
   */
  onMobileItemClick(item: any, index: number) {
    this.focusedElement.set(item);
    this.focusedRowIndex = index;
    this.onFocusedRowChanged({row: {data: item}});
  }

  /**
   * Calculates the total ZUS contribution amount for a given item.
   * Sums health insurance, social insurance, and labor fund contributions.
   * @param item - The ZUS contribution item
   * @returns The total contribution amount
   * @example
   * ```typescript
   * const total = this.getTotalZusAmount({
   *   contributionHealth: 100,
   *   social: 200,
   *   fpfgsw: 50
   * }); // returns 350
   * ```
   */
  getTotalZusAmount(item: any): number {
    return Number(item.contributionHealth || 0) + Number(item.social || 0) + Number(item.fpfgsw || 0);
  }

  /**
   * Cleans up subscriptions when the component is destroyed.
   * Unsubscribes from device type changes to prevent memory leaks.
   * @lifecycle OnDestroy
   */
  ngOnDestroy(): void {
    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();
    }
  }
}
