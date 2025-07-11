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
  @ViewChild('genericDataGrid') genericDataGrid: any;

  event = inject(EventService);
  cdr = inject(ChangeDetectorRef);
  vatRegisterService = inject(VatRegisterService);
  flateRateService = inject(FlateRateService);
  isClosed = signal<boolean>(false);
  mode: 'add' | 'edit' | 'show' = 'add';
  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = 'calc(100vh - 290px)';
  uri: string = 'registeVat/buy';
  pageSize: number = 50;
  focusedElement = signal<VatRegisterBuy | null>(null);
  selectedRows: VatRegisterBuy[] = [];
  focusedRowIndex: number = 0;
  isAdd = signal<boolean>(false);
  isDelete = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];
  month = signal<number>(this.event.globalDate.month);
  year = signal<number>(this.event.globalDate.year);

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

  private readonly translate = inject(TranslateService);

  /** Opcje siatki klientów */
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
