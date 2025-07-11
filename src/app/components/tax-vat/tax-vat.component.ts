import {
  Component,
  inject,
  signal,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
  computed,
} from "@angular/core";
import { Subscription } from "rxjs";
import { DxScrollViewModule } from "devextreme-angular";
import { DxButtonModule } from "devextreme-angular";
import { DxDataGridModule } from "devextreme-angular";
import { DateRangeComponent } from "../date-range/date-range.component";
import { ZusService } from "../../services/zus.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { EventService } from "../../services/event-services.service";
import { PriceFormatPipe } from "../../pipes/price-format.pipe";

import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import DataSource from "devextreme/data/data_source";
import { TaxVat } from "../../interface/tax-vat";
import { CommonModule } from "@angular/common";
import { ShortcutInput, AllowIn } from "ng-keyboard-shortcuts";
import { ConfirmDialogComponent } from "../core/confirm-dialog/confirm-dialog.component";
import { NgShortcutsComponent } from "../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component";
import { TaxVatService } from "../../services/tax-vat.services";
import { AddTaxVatComponent } from "./add-tax-vat/add-tax-vat.component";
import {
  GenericGridColumn,
  GenericGridOptions,
} from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";
import { AppServices } from "../../services/app-services.service";

/**
 * @fileoverview TaxVatComponent manages VAT tax records with data grid functionality.
 * @description This component provides a comprehensive interface for managing VAT tax records,
 * including viewing, adding, editing, and deleting tax entries. It supports keyboard shortcuts,
 * mobile responsiveness, and JPK-VAT XML generation for tax reporting.
 *
 * @component
 * @example
 * ```html
 * <app-tax-vat></app-tax-vat>
 * ```
 *
 * @dependencies
 * - EventService: For global event handling and session management
 * - TaxVatService: For VAT tax CRUD operations
 * - ZusService: For social insurance related operations
 * - TranslateService: For internationalization
 * - AppServices: For application-level services and HTTP operations
 *
 * @features
 * - VAT tax records management (CRUD operations)
 * - Generic data grid with responsive design
 * - Keyboard shortcuts for quick navigation
 * - JPK-VAT XML generation and download
 * - Date range filtering
 * - Mobile-responsive data display
 * - Confirm dialogs for destructive operations
 *
 * @author Angular Team
 * @since 1.0.0
 */
@Component({
  selector: "app-tax-vat",
  imports: [
    DxScrollViewModule,
    DxButtonModule,
    DxDataGridModule,
    DateRangeComponent,
    TranslateModule,
    CommonModule,
    PriceFormatPipe,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    AddTaxVatComponent,
    GenericDataGridComponent,
  ],
  templateUrl: "./tax-vat.component.html",
  styleUrl: "./tax-vat.component.scss",
})
export class TaxVatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("genericDataGrid") genericDataGrid: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  zusService = inject(ZusService);

  month = signal<number>(new Date().getMonth() + 1);
  year = signal<number>(new Date().getFullYear());

  isDelete = signal<boolean>(false);
  isAdd = signal<boolean>(false);
  mode: "add" | "edit" | "show" = "add";
  focusedElement = signal<any>(null);
  dataSource: any;
  heightGrid = "calc(100vh - 105px)";
  focusedRowIndex: number = 0;
  pageSize = 20;
  shortcuts: ShortcutInput[] = [];
  cdr = inject(ChangeDetectorRef);
  taxVatService = inject(TaxVatService);
  private deviceTypeSubscription?: Subscription;

  private readonly appService = inject(AppServices);

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
              e.data.ROK +
              "-" +
              e.data.MIESIAC.toString().padStart(2, "0") +
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
            return e.data.ROK + "-" + e.data.MIESIAC.toString().padStart(2, "0") + "-" + this.getLastDayOfMonth(e.data.ROK, e.data.MIESIAC);
          },
        },
        {
          caption: this.translate.instant("taxVat.taxAmount"),
          dataField: "KWOTA",
          width: 110,
          minWidth: 90,
          hidingPriority: 2, // Wysoki priorytet
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("taxVat.taxExcess"),
          dataField: "NADWYZKA",
          width: 110,
          minWidth: 90,
          hidingPriority: 4,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.paymentDate"),
          dataField: "DATA_WPLATY",
          width: 110,
          minWidth: 90,
          hidingPriority: 5,
          dataType: "date",
          format: { type: this.event.dateFormat },
          alignment: "left",
        },
        {
          caption: this.translate.instant("zus.isPaid"),
          dataField: "ZAPLACONY",
          width: 110,
          minWidth: 80,
          hidingPriority: 6,
          encodeHtml: false,
          dataType: "string",
          cellTemplate: (e: any) => {
            return e.data.ZAPLACONY ? "<img src='../../../assets/images/check-solid.svg' alt='' width='14' />" : "";
          },
        },
      ] as GenericGridColumn[]
  );

  /**
   * Converts any value to a number, defaulting to 0 if value is falsy.
   * @param value - The value to convert to a number
   * @returns The converted number value, or 0 if conversion fails
   * @example
   * ```typescript
   * const result = this.toNumber("123"); // returns 123
   * const fallback = this.toNumber(null); // returns 0
   * ```
   */
  toNumber(value: any): number {
    return Number(value || 0);
  }

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
   * Initiates the process of adding a new VAT tax record.
   * Sets the component mode to 'add' and opens the add dialog.
   * @public
   */
  addNewRecord() {
    this.mode = "add";
    this.isAdd.set(true);
  }

  /**
   * Initiates the process of editing the currently focused VAT tax record.
   * Sets the component mode to 'edit' and opens the edit dialog.
   * @public
   */
  onEdit() {
    this.mode = "edit";
    this.isAdd.set(true);
  }

  /**
   * Initiates the process of viewing the currently focused VAT tax record in read-only mode.
   * Sets the component mode to 'show' and opens the view dialog.
   * @public
   */
  onShow() {
    this.mode = "show";
    this.isAdd.set(true);
  }

  /**
   * Handles date range changes from the date range component.
   * Updates the month and year signals and refreshes the data grid.
   * @param event - The date range change event containing month and year
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
   * Shows the delete confirmation dialog for the currently focused VAT tax record.
   * Only proceeds if the user session is active.
   * @public
   */
  onDeleteConfirm() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(true);
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
   * Handles data grid row focus changes.
   * Updates the focused element signal with the selected row data.
   * @param e - The row focus change event containing row data
   * @public
   */
  onFocusedRowChanged(e: any) {
    this.focusedElement.set(e.row.data);
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
   * Initializes and configures the data source for the VAT tax records grid.
   * Sets up the AspNetData store with appropriate endpoints and event handlers.
   * Automatically focuses on the first row after data loading.
   * @private
   */
  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: "ID_PODATEK_VAT",
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}tax-vat`,
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
   * Constructs the load parameters for the data source.
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
   * Deletes the currently focused VAT tax record.
   * Validates session activity and record existence before proceeding.
   * Refreshes the data grid after successful deletion.
   * @public
   */
  delete() {
    if (!this.event.sessionData.isActive) return;

    const id = this.focusedElement()?.ID_PODATEK_VAT;
    if (!id) return;

    this.taxVatService.delete(id).subscribe({
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
   * Handles the saving event from the add/edit dialog.
   * Reloads the data source and focuses on the saved record.
   * @param event - The save event containing the record ID
   * @param event.id - The ID of the saved record
   * @public
   */
  onSaving(event: any) {
    this.dataSource.reload().then((data: TaxVat[]) => {
      const index = data.findIndex(
        (x: any) => x.ID_PODATEK_VAT == Number(event.id)
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
   * Handles the closing event from dialogs.
   * Hides the add/edit dialog and returns focus to the data grid.
   * @public
   */
  onClosing() {
    this.isAdd.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Handles global Escape key press events.
   * Triggers the closing action to hide any open dialogs.
   * @param event - The keyboard event
   * @hostlistener
   */
  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    this.onClosing();
  }

  /**
   * Retrieves data items for mobile view rendering.
   * Safely accesses the data source items with fallback to empty array.
   * @returns Array of data items for mobile display
   * @public
   */
  getMobileDataItems(): any[] {
    if (this.dataSource && this.dataSource.items) {
      return this.dataSource.items() || [];
    }
    return [];
  }

  /**
   * Handles click events on mobile data items.
   * Updates the focused element and row index, then triggers row focus change.
   * @param item - The clicked data item
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

  /**
   * Generates and downloads a JPK-VAT XML file for tax reporting.
   * Creates a request to generate the XML file, then downloads it automatically.
   * The file is saved with a default name if no filename is provided.
   * @public
   * @example
   * ```typescript
   * this.jpk(); // Generates and downloads JPK-VAT XML for current period
   * ```
   */
  jpk(){
    const data = {
      dateFrom: "2025-01-01",
      dateTo: "2025-01-31",
      jpkType: 'VAT',
      formatType: "initupload"
    }
    
    this.appService.postAuth(`jpk/generate-xml`, data).subscribe({
      next: (res) => {
        console.log(res);
        // Używamy bezpośrednio HttpClient z opcjami dla blob
        this.appService['http'].get(`${this.appService.baseUrl}jpk/download?fileName=${res.fileName}`, {
          headers: this.appService.headers,
          responseType: 'blob',
          
        }).subscribe({
          next: (blob) => {
            // Tworzenie linku do pobrania pliku
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = res.fileName || 'jpk-vat.xml';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            console.log(err);
          }
        })
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}
