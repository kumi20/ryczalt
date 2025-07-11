import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  computed,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
} from "devextreme-angular";
import { EventService } from "../../services/event-services.service";
import {
  AllowIn,
  KeyboardShortcutsComponent,
  ShortcutInput,
} from "ng-keyboard-shortcuts";

import DataSource from "devextreme/data/data_source";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import { FlatRateTax } from "../../interface/flatRateTax";
import { CommonModule } from "@angular/common";
import { DateRangeComponent } from "../date-range/date-range.component";
import { ConfirmDialogComponent } from "../core/confirm-dialog/confirm-dialog.component";
import { NgShortcutsComponent } from "../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component";
import { NewFlatRateTaxComponent } from "./new-flat-rate-tax/new-flat-rate-tax.component";
import { FlatRateTaxService } from "../../services/flat-rate-tax.service";
import { GenericGridOptions, GenericGridColumn } from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";
import { PriceFormatPipe } from "../../pipes/price-format.pipe";
/**
 * @fileoverview FlatRateTaxComponent manages flat rate tax records for entrepreneurs.
 * @description This component provides a comprehensive interface for managing flat rate tax records,
 * including income tracking, social insurance deductions, health insurance contributions,
 * and tax payment management. It supports annual view and full CRUD operations.
 *
 * @component
 * @example
 * ```html
 * <app-flat-rate-tax></app-flat-rate-tax>
 * ```
 *
 * @dependencies
 * - EventService: For global event handling and session management
 * - FlatRateTaxService: For flat rate tax CRUD operations
 * - TranslateService: For internationalization support
 *
 * @features
 * - Flat rate tax records management (CRUD operations)
 * - Income and social insurance tracking
 * - Health insurance reduction calculations
 * - Tax payment status management
 * - Annual date range filtering
 * - Generic data grid with responsive design
 * - Keyboard shortcuts for efficient navigation
 * - Mobile-responsive interface
 * - Confirm dialogs for safe operations
 *
 * @author Angular Team
 * @since 1.0.0
 */
@Component({
  selector: "app-flat-rate-tax",
  imports: [
    DxDataGridModule,
    DxScrollViewModule,
    DxButtonModule,
    TranslateModule,
    CommonModule,
    DateRangeComponent,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    NewFlatRateTaxComponent,
    GenericDataGridComponent,
    PriceFormatPipe,
  ],
  templateUrl: "./flat-rate-tax.component.html",
  styleUrl: "./flat-rate-tax.component.scss",
})
export class FlatRateTaxComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Reference to the generic data grid component for focus management and data operations
   * @type {any}
   * @description Provides access to the generic data grid instance for programmatic control
   * @since 1.0.0
   */
  @ViewChild("genericDataGrid") genericDataGrid: any;
  
  /**
   * Injected translation service for internationalization support
   * @type {TranslateService}
   * @description Provides translation capabilities for component labels and messages
   * @since 1.0.0
   */
  translate = inject(TranslateService);
  
  /**
   * Injected event service for global application events and utilities
   * @type {EventService}
   * @description Handles global events, notifications, and common utilities
   * @since 1.0.0
   */
  event = inject(EventService);
  
  /**
   * Injected flat rate tax service for CRUD operations
   * @type {FlatRateTaxService}
   * @description Manages flat rate tax data operations including create, read, update, and delete
   * @since 1.0.0
   */
  flatRateTaxService = inject(FlatRateTaxService);

  /**
   * Injected change detector reference for manual change detection
   * @type {ChangeDetectorRef}
   * @description Enables manual triggering of change detection cycles
   * @since 1.0.0
   */
  cdr = inject(ChangeDetectorRef);
  
  /**
   * Array of keyboard shortcuts for the component
   * @type {ShortcutInput[]}
   * @description Contains keyboard shortcut configurations for various actions
   * @default []
   * @since 1.0.0
   */
  shortcuts: ShortcutInput[] = [];
  
  /**
   * Subscription to device type changes for responsive behavior
   * @type {Subscription | undefined}
   * @description Tracks device type changes to update UI accordingly
   * @private
   * @since 1.0.0
   */
  private deviceTypeSubscription?: Subscription;

  /**
   * Data source for the DevExtreme data grid
   * @type {DataSource}
   * @description Manages flat rate tax data for the grid component
   * @default new DataSource({})
   * @since 1.0.0
   */
  dataSource: DataSource = new DataSource({});
  
  /**
   * Height configuration for the data grid
   * @type {number | string}
   * @description Defines the height of the data grid using CSS calc
   * @default "calc(100vh - 105px)"
   * @since 1.0.0
   */
  heightGrid: number | string = "calc(100vh - 105px)";
  
  /**
   * Signal containing the currently focused flat rate tax element
   * @type {Signal<FlatRateTax | null>}
   * @description Tracks the currently selected flat rate tax record
   * @default null
   * @since 1.0.0
   */
  focusedElement = signal<FlatRateTax | null>(null);
  
  /**
   * Signal containing the current year for filtering records
   * @type {Signal<number>}
   * @description Current year used for date range filtering
   * @default current year from global date
   * @since 1.0.0
   */
  year = signal<number>(this.event.globalDate.year);
  
  /**
   * Index of the currently focused row in the data grid
   * @type {number}
   * @description Zero-based index of the focused row for navigation
   * @default 0
   * @since 1.0.0
   */
  focusedRowIndex: number = 0;
  
  /**
   * Number of items per page in the data grid
   * @type {number}
   * @description Controls pagination size for the data grid
   * @default 30
   * @since 1.0.0
   */
  pageSize: number = 30;

  /**
   * Current mode of the component operation
   * @type {"add" | "edit" | "show"}
   * @description Determines the current operation mode for the record dialog
   * @default "add"
   * @since 1.0.0
   */
  mode: "add" | "edit" | "show" = "add";
  
  /**
   * Signal indicating whether the add/edit dialog is open
   * @type {Signal<boolean>}
   * @description Controls the visibility of the add/edit dialog
   * @default false
   * @since 1.0.0
   */
  isAdd = signal<boolean>(false);
  
  /**
   * Signal indicating whether the delete confirmation dialog is open
   * @type {Signal<boolean>}
   * @description Controls the visibility of the delete confirmation dialog
   * @default false
   * @since 1.0.0
   */
  isDelete = signal<boolean>(false);
  

  /**
   * Computed options for the generic data grid configuration
   * @type {ComputedSignal<GenericGridOptions>}
   * @description Provides configuration options for the flat rate tax data grid
   * @since 1.0.0
   */
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

  /**
   * Computed columns configuration for the data grid
   * @type {ComputedSignal<GenericGridColumn[]>}
   * @description Defines column structure and formatting for the flat rate tax grid
   * @since 1.0.0
   */
  columns = computed(() => [
    {
      caption: this.translate.instant("zus.periodFrom"),
      dataField: "month",
      width: 110,
      minWidth: 90,
      hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
      cellTemplate: (e: any) => {
        return e.data.year + "-" + e.data.month.toString().padStart(2, "0") + "-01";
      },
    },
    {
      caption: this.translate.instant("zus.periodTo"),
      dataField: "year",
      width: 110,
      minWidth: 90,
      hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
      cellTemplate: (e: any) => {
        return e.data.year + "-" + e.data.month.toString().padStart(2, "0") + "-" + this.getLastDayOfMonth(e.data.year, e.data.month);
      },
    },
    {
      caption: this.translate.instant("internalEvidence.income"),
      dataField: "income",
      width: 110,
      minWidth: 90,
      hidingPriority: 4,
      customizeText: this.event.formatKwota
    },
    {
      caption: this.translate.instant("zus.title"),
      dataField: "socialInsurance",
      width: 200,
      minWidth: 120,
      hidingPriority: 5,
      customizeText: this.event.formatKwota
    },
    {
      caption: this.translate.instant("flatRateTax.amountFlatRateTax"),
      dataField: "amountFlatRateTax",
      width: 200,
      minWidth: 120,
      hidingPriority: 2, // Wysoki priorytet
      customizeText: this.event.formatKwota
    },
    {
      caption: this.translate.instant("flatRateTax.healthInsurance"),
      dataField: "reductionAmountHealt",
      width: 200,
      minWidth: 120,
      hidingPriority: 6,
      customizeText: this.event.formatKwota
    },
    {
      caption: this.translate.instant("zus.paymentDate"),
      dataField: "dataPayment",
      width: 110,
      minWidth: 90,
      hidingPriority: 7,
      dataType: "date",
      format: { type: this.event.dateFormat },
      alignment: "left"
    },
    {
      caption: this.translate.instant("zus.isPaid"),
      dataField: "isPaid",
      width: 100,
      minWidth: 80,
      hidingPriority: 8,
      dataType: "string",
      alignment: "left",
      encodeHtml: false,
      customizeText: (e: any) => {
        return e.value ? `<img src="../../../assets/images/check-solid.svg" alt="" width="14" />` : '';
      }
    }
  ] as GenericGridColumn[]);

  /**
   * Creates an instance of FlatRateTaxComponent.
   * @constructor
   */
  constructor() {}

  /**
   * Initializes the component by loading data and setting up device type subscription.
   * Called once after component initialization.
   * @lifecycle OnInit
   */
  ngOnInit(): void {
    this.getData();
    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  /**
   * Sets up keyboard shortcuts after view initialization.
   * Defines shortcuts for adding (Alt+N), editing (F2), viewing (Shift+F2), and deleting (Del) records.
   * @lifecycle AfterViewInit
   */
  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: "alt + n",
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: () => {
          this.addNewRecord();
        },
      },
      {
        key: "F2",
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (data) => {
          if (data.event.shiftKey) this.onShow();
          if (!data.event.shiftKey) this.onEdit();
        },
      },

      {
        key: "del",
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: () => {
          this.onDeleteConfirm();
        },
      },
    ];
    this.cdr.detectChanges();
  }

  /**
   * Initiates the process of adding a new flat rate tax record.
   * Sets the component mode to 'add' and opens the add dialog.
   * @public
   */
  addNewRecord() {
    this.mode = "add";
    this.isAdd.set(true);
  }

  /**
   * Initiates the process of editing the currently focused flat rate tax record.
   * Sets the component mode to 'edit' and opens the edit dialog.
   * @public
   */
  onEdit() {
    this.mode = "edit";
    this.isAdd.set(true);
  }

  /**
   * Shows the delete confirmation dialog for the currently focused flat rate tax record.
   * @public
   */
  onDeleteConfirm() {
    this.isDelete.set(true);
  }

  /**
   * Initiates the process of viewing the currently focused flat rate tax record in read-only mode.
   * Sets the component mode to 'show' and opens the view dialog.
   * @public
   */
  onShow() {
    this.mode = "show";
    this.isAdd.set(true);
  }

  /**
   * Handles key down events on the data grid.
   * Prevents default behavior for specific keys to avoid conflicts.
   * @param event - The key down event
   * @public
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ["F2", "Escape", "Delete", "Enter"];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Initializes and configures the data source for flat rate tax records.
   * Sets up the AspNetData store with appropriate endpoints and event handlers.
   * Automatically focuses on the first row after data loading.
   * @private
   */
  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: "flatRateTaxId",
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}flat-rate-tax`,
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
   * Constructs the load parameters for the flat rate tax data source.
   * Includes the selected year for filtering records.
   * @returns An object containing the load parameters
   * @private
   */
  getLoadParams() {
    let obj: any = {};
    obj.year = this.year();
    return obj;
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
   * @param e - The double-click event
   * @public
   */
  onRowDblClick(e: any) {
    this.onEdit();
  }

  /**
   * Handles data grid row focus changes.
   * Updates the focused element signal with the selected row data.
   * @param event - The row focus change event containing row data
   * @public
   */
  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  /**
   * Handles date range changes from the date range component.
   * Updates the year signal and refreshes the data grid.
   * @param event - The date range change event
   * @param event.month - The selected month (not used in this component)
   * @param event.year - The selected year
   * @public
   */
  onDateRangeChange(event: { month: number; year: number }) {
    this.year.set(event.year);
    this.getData();
  }

  /**
   * Handles the saving event from the add/edit dialog.
   * Reloads the data source and focuses on the saved record.
   * @param event - The save event containing the record ID
   * @param event.id - The ID of the saved flat rate tax record
   * @public
   */
  onSaving(event: any) {
    this.dataSource.reload().then((data: FlatRateTax[]) => {
      const index = data.findIndex((x: any) => x.flatRateTaxId == event.id);

      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
    });
    this.isAdd.set(false);
  }

  /**
   * Deletes the currently focused flat rate tax record.
   * Validates session activity and record existence before proceeding.
   * Refreshes the data grid after successful deletion.
   * @public
   */
  delete() {
    if (!this.event.sessionData.isActive) return;

    const id = this.focusedElement()?.flatRateTaxId;
    if (!id) return;

    this.flatRateTaxService.delete(id).subscribe({
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
   * Retrieves data items for mobile view rendering.
   * Safely accesses the data source items with fallback to empty array.
   * @returns Array of flat rate tax data items for mobile display
   * @public
   */
  getMobileDataItems(): any[] {
    if (this.dataSource && this.dataSource.items) {
      return this.dataSource.items() || [];
    }
    return [];
  }

  /**
   * Handles click events on mobile flat rate tax items.
   * Updates the focused element and row index, then triggers row focus change.
   * @param item - The clicked flat rate tax data item
   * @param index - The index of the clicked item
   * @public
   */
  onMobileItemClick(item: any, index: number) {
    this.focusedElement.set(item);
    this.focusedRowIndex = index;
    this.onFocusedRowChanged({row: {data: item}});
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
