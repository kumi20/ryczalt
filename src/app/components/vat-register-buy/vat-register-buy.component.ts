import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  signal,
  inject,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { DxoGridModule } from 'devextreme-angular/ui/nested';
import { EventService } from '../../services/event-services.service';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  VatRegisterBuy,
  VatPurchaseSummary,
} from '../../interface/vatRegister';
import { PriceFormatPipe } from '../../pipe/currency';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { VatRegisterService } from '../../services/vatRegister.service';
import { FlateRateService } from '../../services/flateRate.services';
import { sign } from 'crypto';
import {
  OpenCloseRequest,
  CheckIfMonthIsClosed,
} from '../../interface/flateRate';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { NewVatRegisterBuyComponent } from './new-vat-register-buy/new-vat-register-buy.component';
import { DateRangeComponent } from '../date-range/date-range.component';
import { GenericGridColumn, GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

/**
 * @fileoverview VatRegisterBuyComponent manages VAT purchase register records.
 * @description This component provides a comprehensive interface for managing VAT purchase register,
 * including invoice tracking, VAT deduction calculations, monthly summaries, and month closure management.
 * It supports detailed VAT analysis with different tax rates and deductible amounts.
 *
 * @component
 * @example
 * ```html
 * <app-vat-register-buy></app-vat-register-buy>
 * ```
 *
 * @dependencies
 * - EventService: For global event handling and session management
 * - VatRegisterService: For VAT register CRUD operations and summary calculations
 * - FlateRateService: For month closure status management
 * - TranslateService: For internationalization support
 *
 * @features
 * - VAT purchase register management (CRUD operations)
 * - Monthly VAT summaries with different tax rates (23%, 8%, 5%)
 * - Deductible and non-deductible VAT tracking
 * - Month closure status management
 * - Generic data grid with responsive design
 * - Keyboard shortcuts for efficient navigation
 * - Date range filtering by month and year
 * - Mobile-responsive interface
 * - Detailed VAT analysis and reporting
 *
 * @author Angular Team
 * @since 1.0.0
 */
@Component({
  selector: 'app-vat-register-buy',
  imports: [
    DxButtonModule,
    DxoGridModule,
    DxTooltipModule,
    DxScrollViewModule,
    CommonModule,
    TranslateModule,
    DxDataGridModule,
    PriceFormatPipe,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    NewVatRegisterBuyComponent,
    DateRangeComponent,
    GenericDataGridComponent
  ],
  templateUrl: './vat-register-buy.component.html',
  styleUrl: './vat-register-buy.component.scss',
})
export class VatRegisterBuyComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Reference to the generic data grid component for programmatic control
   * @type {any}
   * @description Provides access to the generic data grid instance for focus management
   * @since 1.0.0
   */
  @ViewChild('genericDataGrid') genericDataGrid: any;

  /**
   * Injected event service for global application events and utilities
   * @type {EventService}
   * @description Handles global events, notifications, and common utilities
   * @since 1.0.0
   */
  event = inject(EventService);
  
  /**
   * Injected change detector reference for manual change detection
   * @type {ChangeDetectorRef}
   * @description Enables manual triggering of change detection cycles
   * @since 1.0.0
   */
  cdr = inject(ChangeDetectorRef);
  
  /**
   * Injected VAT register service for purchase register operations
   * @type {VatRegisterService}
   * @description Manages VAT purchase register data operations including CRUD and summaries
   * @since 1.0.0
   */
  vatRegisterService = inject(VatRegisterService);
  
  /**
   * Injected flat rate service for month closure operations
   * @type {FlateRateService}
   * @description Manages month closure status and related operations
   * @since 1.0.0
   */
  flateRateService = inject(FlateRateService);
  
  /**
   * Signal indicating whether the current month is closed for editing
   * @type {Signal<boolean>}
   * @description Tracks month closure status to prevent editing when closed
   * @default false
   * @since 1.0.0
   */
  isClosed = signal<boolean>(false);
  
  /**
   * Current mode of the component operation
   * @type {"add" | "edit" | "show"}
   * @description Determines the current operation mode for the record dialog
   * @default "add"
   * @since 1.0.0
   */
  mode: 'add' | 'edit' | 'show' = 'add';
  
  /**
   * Data source for the DevExtreme data grid
   * @type {DataSource}
   * @description Manages VAT purchase register data for the grid component
   * @default new DataSource({})
   * @since 1.0.0
   */
  dataSource: DataSource = new DataSource({});
  
  /**
   * Height configuration for the data grid
   * @type {number | string}
   * @description Defines the height of the data grid using CSS calc
   * @default "calc(100vh - 290px)"
   * @since 1.0.0
   */
  heightGrid: number | string = 'calc(100vh - 290px)';
  
  /**
   * URI endpoint for VAT purchase register operations
   * @type {string}
   * @description API endpoint for VAT purchase register operations
   * @default "registeVat/buy"
   * @since 1.0.0
   */
  uri: string = 'registeVat/buy';
  
  /**
   * Number of items per page in the data grid
   * @type {number}
   * @description Controls pagination size for the data grid
   * @default 50
   * @since 1.0.0
   */
  pageSize: number = 50;
  
  /**
   * Signal containing the currently focused VAT purchase register element
   * @type {Signal<VatRegisterBuy | null>}
   * @description Tracks the currently selected VAT purchase register record
   * @default null
   * @since 1.0.0
   */
  focusedElement = signal<VatRegisterBuy | null>(null);
  
  /**
   * Array of currently selected rows in the data grid
   * @type {VatRegisterBuy[]}
   * @description Contains the selected VAT purchase register records
   * @default []
   * @since 1.0.0
   */
  selectedRows: VatRegisterBuy[] = [];
  
  /**
   * Index of the currently focused row in the data grid
   * @type {number}
   * @description Zero-based index of the focused row for navigation
   * @default 0
   * @since 1.0.0
   */
  focusedRowIndex: number = 0;
  
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
   * Array of keyboard shortcuts for the component
   * @type {ShortcutInput[]}
   * @description Contains keyboard shortcut configurations for various actions
   * @default []
   * @since 1.0.0
   */
  shortcuts: ShortcutInput[] = [];
  
  /**
   * Signal containing the current month (1-12)
   * @type {Signal<number>}
   * @description Current month used for date range filtering
   * @default current month from global date
   * @since 1.0.0
   */
  month = signal<number>(this.event.globalDate.month);
  
  /**
   * Signal containing the current year
   * @type {Signal<number>}
   * @description Current year used for date range filtering
   * @default current year from global date
   * @since 1.0.0
   */
  year = signal<number>(this.event.globalDate.year);

  /**
   * Monthly summary data for VAT purchase register totals
   * @type {VatPurchaseSummary}
   * @description Contains aggregated totals for different VAT rates and deductible amounts
   * @default Object with all VAT summary values set to 0
   * @since 1.0.0
   */
  summaryMonthData: VatPurchaseSummary = {
    total_net_23: 0,
    total_vat_23: 0,
    total_net_8: 0,
    total_vat_8: 0,
    total_net_5: 0,
    total_vat_5: 0,
    total_zw_net_23: 0,
    total_zw_vat_23: 0,
    total_zw_net_8: 0,
    total_zw_vat_8: 0,
    total_zw_net_5: 0,
    total_zw_vat_5: 0,
    total_net: 0,
    total_net_not_deductible: 0,
    total_gross: 0,
    total_net_deductible: 0,
    total_vat_deductible: 0,
  };

  /**
   * Injected translation service for internationalization support
   * @type {TranslateService}
   * @description Provides translation capabilities for component labels and messages
   * @private
   * @readonly
   * @since 1.0.0
   */
  private readonly translate = inject(TranslateService);

  /**
   * Computed options for the generic data grid configuration
   * @type {ComputedSignal<GenericGridOptions>}
   * @description Provides configuration options for the VAT purchase register data grid
   * @since 1.0.0
   */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 290px)",
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
   * @description Defines column structure and formatting for the VAT purchase register grid
   * @since 1.0.0
   */
  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant('vatRegister.nrInvoices'),
          dataField: 'documentNumber',
          width: 200,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet
        },
        {
          caption: this.translate.instant('vatRegister.recivedDate'),
          dataField: 'dateOfSell',
          width: 200,
          allowSorting: false,
          hidingPriority: 4, // Średni priorytet
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.dateOfIssue'),
          dataField: 'documentDate',
          width: 300,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.customerName'),
          dataField: 'customerName',
          width: 300,
          allowSorting: false,
          hidingPriority: 2, // Wysoki priorytet
        },
        {
          caption: this.translate.instant('vatRegister.gorssBuyValue'),
          dataField: 'grossSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 3, // Średni priorytet
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant('vatRegister.deductibleVat'),
          dataField: 'vatSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 6, // Najniższy priorytet
          customizeText: this.event.formatKwota,
        },
      ] as GenericGridColumn[]
  )

  /**
   * Creates an instance of VatRegisterBuyComponent.
   * Initializes the monthly VAT summary data structure.
   * @constructor
   */
  constructor() {}

  /**
   * Initializes the component by loading VAT purchase register data.
   * Called once after component initialization.
   * @lifecycle OnInit
   */
  ngOnInit(): void {
    this.getData();
  }

  /**
   * Sets up keyboard shortcuts after view initialization.
   * Defines shortcuts for adding (Alt+N), editing (F2), viewing (Shift+F2), and deleting (Del) records.
   * @lifecycle AfterViewInit
   */
  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: 'alt + n',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: () => {
          this.addNewRecord();
        },
      },
      {
        key: 'F2',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (data) => {
          if (data.event.shiftKey) this.onShow();
          if (!data.event.shiftKey) this.onEdit();
        },
      },

      {
        key: 'del',
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
   * Checks if the current month is closed for editing.
   * Updates the isClosed signal based on the server response.
   * @private
   */
  checkIfMonthIsClosed() {
    this.flateRateService
      .checkIfMonthIsClosed(this.month(), this.year())
      .subscribe({
        next: (data: CheckIfMonthIsClosed) => {
          this.isClosed.set(data.isClosed);
        },
        error: (error) => {
          this.event.httpErrorNotification(error);
        },
      });
  }

  /**
   * Initializes and configures the data source for VAT purchase register records.
   * Checks month closure status, loads monthly summary, and sets up the AspNetData store.
   * Automatically focuses on the first row after data loading.
   * @private
   */
  getData() {
    this.checkIfMonthIsClosed();
    this.summaryMonth();
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'vatRegisterId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}${this.uri}`,
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
   * Constructs the load parameters for the VAT purchase register data source.
   * Includes the selected month and year for filtering records.
   * @returns An object containing the load parameters
   * @private
   */
  getLoadParams() {
    let obj: any = {};
    obj.month = this.month();
    obj.year = this.year();
    return obj;
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
   * Handles key down events on the data grid.
   * Prevents default behavior for specific keys to avoid conflicts.
   * @param event - The key down event
   * @public
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Decrements the current month by 1 if not already at minimum (January).
   * Refreshes the data after month change.
   * @public
   */
  minusMonth() {
    if (this.month() > 1) {
      this.month.set(this.month() - 1);
    }
    this.getData();
  }

  /**
   * Increments the current month by 1 if not already at maximum (December).
   * Refreshes the data after month change.
   * @public
   */
  plusMonth() {
    if (this.month() < 12) {
      this.month.set(this.month() + 1);
    }
    this.getData();
  }

  /**
   * Decrements the current year by 1.
   * Refreshes the data after year change.
   * @public
   */
  minusYear() {
    this.year.set(this.year() - 1);
    this.getData();
  }

  /**
   * Increments the current year by 1.
   * Refreshes the data after year change.
   * @public
   */
  plusYear() {
    this.year.set(this.year() + 1);
    this.getData();
  }

  /**
   * Initiates the process of adding a new VAT purchase register record.
   * Validates session activity and month closure status before proceeding.
   * @public
   */
  addNewRecord() {
    this.mode = 'add';
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
  }

  /**
   * Handles the saving event from the add/edit dialog.
   * Reloads the data source, updates monthly summary, focuses on the saved record,
   * and checks month closure status.
   * @param event - The save event containing the record ID
   * @param event.vatRegisterId - The VAT register ID object
   * @public
   */
  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      this.summaryMonth();
      const index = data.findIndex(
        (x: any) =>
          x.vatRegisterId === Number(event.vatRegisterId.vatRegisterId)
      );
      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
      this.checkIfMonthIsClosed();
      this.cdr.detectChanges();
    });
  }


  /**
   * Initiates the process of editing the currently focused VAT purchase register record.
   * Validates session activity and month closure status before proceeding.
   * @public
   */
  onEdit() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Retrieves the currently focused row data from the data grid.
   * @returns The focused row data
   * @private
   */
  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  /**
   * Initiates the process of viewing the currently focused VAT purchase register record in read-only mode.
   * @public
   */
  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Shows the delete confirmation dialog for the currently focused VAT purchase register record.
   * Validates session activity and month closure status before proceeding.
   * @public
   */
  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
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
   * Closes the delete confirmation dialog and returns focus to the data grid.
   * @public
   */
  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Deletes the currently focused VAT purchase register record.
   * Validates session activity and month closure status before proceeding.
   * Reloads the data source after successful deletion.
   * @public
   */
  delete() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().vatRegisterId;
    this.vatRegisterService.delete(id).subscribe({
      next: () => {
        this.dataSource.reload().then(() => {
          this.focusedRowIndex = 0;
        });
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  /**
   * Toggles the open/close status of the current month.
   * If month is closed, opens it; if open, closes it.
   * Refreshes data after successful operation.
   * @public
   */
  onOpenClose() {
    const object: OpenCloseRequest = {
      month: this.month(),
      year: this.year(),
    };
    if (this.isClosed()) {
      this.flateRateService.openMonth(object).subscribe({
        next: () => {
          this.getData();
        },
        error: (error) => {
          this.event.httpErrorNotification(error);
        },
      });
      return;
    }

    this.flateRateService.closeMonth(object).subscribe({
      next: () => {
        this.getData();
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  /**
   * Loads the monthly VAT purchase summary for the current month and year.
   * Updates the summaryMonthData with detailed VAT calculations including
   * different tax rates, deductible amounts, and totals.
   * @private
   */
  summaryMonth() {
    this.vatRegisterService.summaryMonthBuy(this.month(), this.year()).subscribe({
      next: (data: VatPurchaseSummary) => {
        this.summaryMonthData = data;
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  /**
   * Handles date range changes from the date range component.
   * Updates the month and year signals and refreshes the data grid.
   * @param event - The date range change event
   * @param event.month - The selected month (1-12)
   * @param event.year - The selected year
   * @public
   */
  onDateRangeChange(event: {month: number, year: number}) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }


  /**
   * Cleans up resources when the component is destroyed.
   * Currently no cleanup is required but method is implemented for future use.
   * @lifecycle OnDestroy
   */
  ngOnDestroy(): void {}

}
