import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  computed,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FlateRateService } from '../../services/flateRate.services';
import { EventService } from '../../services/event-services.service';
import { CheckIfMonthIsClosed } from '../../interface/flateRate';
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';
import {
  OpenCloseRequest,
  FlateRate,
  SummaryMonth,
} from '../../interface/flateRate';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import { PriceFormatPipe } from '../../pipe/currency';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { error } from 'console';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { NewFlateRateComponent } from './new-flate-rate/new-flate-rate.component';
import { NewVatRegisterComponent } from '../vat-register/new-vat-register/new-vat-register.component';
import { VatRegisterService } from '../../services/vatRegister.service';
import { DateRangeComponent } from '../date-range/date-range.component';
import { GenericGridColumn, GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

/**
 * Component for managing flat rate tax records in the tax application.
 * 
 * @description This component provides a comprehensive interface for managing flat rate tax records,
 * including creating, editing, viewing, and deleting records. It supports various tax rates
 * (3%, 5.5%, 8.5%, 10%, 12%, 12.5%, 14%, 15%, 17%) and provides monthly summaries.
 * The component also handles VAT register integration and month closure functionality.
 * 
 * @example
 * ```html
 * <app-flate-rate></app-flate-rate>
 * ```
 * 
 * @since 1.0.0
 * @author Tax Application Team
 */
@Component({
  selector: 'app-flate-rate',
  standalone: true,
  imports: [
    GenericDataGridComponent,
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    PriceFormatPipe,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    DxTooltipModule,
    NewFlateRateComponent,
    DxScrollViewModule,
    NewVatRegisterComponent,
    DateRangeComponent
  ],
  templateUrl: './flate-rate.component.html',
  styleUrl: './flate-rate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlateRateComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Reference to the generic data grid component */
  @ViewChild("genericDataGrid") genericDataGrid: any;
  
  /** Injected flat rate service for data operations */
  flateRateService = inject(FlateRateService);
  
  /** Injected event service for global application events */
  event = inject(EventService);
  
  /** Injected change detector reference for manual change detection */
  cdr = inject(ChangeDetectorRef);
  
  /** Injected translation service for internationalization */
  private readonly translate = inject(TranslateService);

  /** Signal indicating whether the current month is closed for editing */
  isClosed = signal<boolean>(false);
  
  /** Current mode of the component: 'add', 'edit', or 'show' */
  mode: 'add' | 'edit' | 'show' = 'add';
  
  /** Data source for the DevExtreme data grid */
  dataSource: DataSource = new DataSource({});
  
  /** Array of currently selected rows in the data grid */
  selectedRows: FlateRate[] = [];
  
  /** Index of the currently focused row in the data grid */
  focusedRowIndex: number = 0;
  
  /** Signal containing the currently focused flat rate element */
  focusedElement = signal<FlateRate | null>(null);
  
  /** Signal indicating whether the add/edit dialog is open */
  isAdd = signal<boolean>(false);
  
  /** Number of items per page in the data grid */
  pageSize: number = 50;
  
  /** Signal indicating whether the delete confirmation dialog is open */
  isDelete = signal<boolean>(false);
  
  /** Array of keyboard shortcuts for the component */
  shortcuts: ShortcutInput[] = [];

   /** Computed options for the data grid configuration */
   options = computed(
    () =>
      ({
        height: "calc(100vh - 245px)",
        columnResizingMode: 'widget',
        allowColumnResizing: true,
        allowColumnReordering: true,
        columnAutoWidth: false,
        wordWrapEnabled: false,
        showBorders: true,
        scrolling: {
          mode: 'standard',
          columnRenderingMode: 'standard',
          rowRenderingMode: 'standard',
          useNative: false,
        },
        columnHidingEnabled: true,
        columnChooser: {
          enabled: true,
          mode: 'select',
          searchEnabled: true,
          sortOrder: 'asc',
        },
      } as GenericGridOptions)
  );  

  /** Monthly summary data containing totals for each tax rate */
  summaryMonthData: SummaryMonth = {
    sum_rate17: 0,
    sum_rate15: 0,
    sum_rate14: 0,
    sum_rate12_5: 0,
    sum_rate12: 0,
    sum_rate10: 0,
    sum_rate8_5: 0,
    sum_rate5_5: 0,
    sum_rate3: 0,
    total_sum: 0,
  };
  
  /** Signal indicating whether the VAT register addition dialog is open */
  isAddVatRegister = signal<boolean>(false);
  
  /** Parameters for document number used in VAT register creation */
  paramsNumber: any;
  
  /** Signal indicating whether the new VAT register form is open */
  isNewVatRegister = signal<boolean>(false);
  
  /** Flat rate data to be used for VAT register creation */
  vatRegisterFlate: FlateRate | null = null;
  
  /** Signal indicating whether the VAT register deletion confirmation dialog is open */
  isConfirmDeleteVatRegister = signal<boolean>(false);
  
  /** ID of the VAT register entry to be deleted */
  vatRegisterId: number | null = null;
  
  /** Signal containing the current month (1-12) */
  month = signal<number>(this.event.globalDate.month);
  
  /** Signal containing the current year */
  year = signal<number>(this.event.globalDate.year);
  
  /** Injected VAT register service for VAT-related operations */
  vatRegisterService = inject(VatRegisterService);

  /** Computed columns configuration for the data grid */
  columns = computed(
    () =>
      [
        {
          caption: 'Lp',
          dataField: 'lp',
          width: 50,
          minWidth: 50,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant('flateRate.dateOfEntry'),
          dataField: 'dateOfEntry',
          width: 110,
          minWidth: 100,
          allowSorting: false,
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant('flateRate.documentNumber'),
          dataField: 'documentNumber',
          allowSorting: false,
          width: 200,
          minWidth: 120,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant('flateRate.totalRevenue'),
          dataField: 'totalRevenue',
          width: 200,
          minWidth: 100,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 2, // Wysoki priorytet
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 17%',
          dataField: 'rate17',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 4,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 8,5%',
          dataField: 'rate8_5',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 5,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 5,5%',
          dataField: 'rate5_5',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 3%',
          dataField: 'rate3',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 7,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 10%',
          dataField: 'rate10',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 8,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 12%',
          dataField: 'rate12',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 9,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 12,5%',
          dataField: 'rate12_5',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 10,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 14%',
          dataField: 'rate14',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 11,
        },
        {
          caption: this.translate.instant('flateRate.rate') + ' 15%',
          dataField: 'rate15',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          customizeText: this.event.formatKwota,
          hidingPriority: 12,
        }
      ] as GenericGridColumn []
  )

  /**
   * Component constructor.
   * 
   * @description Initializes the FlateRateComponent with default values.
   * @since 1.0.0
   */
  constructor() {}

  /**
   * Angular lifecycle hook called after component initialization.
   * 
   * @description Initializes the component by loading flat rate data for the current month and year.
   * This method is called once after the component's data-bound properties have been initialized.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  ngOnInit(): void {
    this.getData();
    
  }

  /**
   * Angular lifecycle hook called after view initialization.
   * 
   * @description Sets up keyboard shortcuts for the component after the view has been initialized.
   * Configures shortcuts for adding new records (Alt+N), editing/showing records (F2), 
   * and deleting records (Delete key).
   * 
   * @returns {void}
   * @since 1.0.0
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
   * Angular lifecycle hook called before component destruction.
   * 
   * @description Cleans up resources and subscriptions before the component is destroyed.
   * Currently empty but reserved for future cleanup operations.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  ngOnDestroy(): void {}

  /**
   * Handles data grid row focus change events.
   * 
   * @description Updates the focused element signal when a different row is focused in the data grid.
   * This allows other parts of the component to react to the currently selected row.
   * 
   * @param {any} event - The focus change event containing row data
   * @returns {void}
   * @since 1.0.0
   */
  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  /**
   * Handles keyboard events for the data grid.
   * 
   * @description Prevents default behavior for specific keys (F2, Escape, Delete, Enter)
   * to allow custom keyboard shortcuts to function properly.
   * 
   * @param {any} event - The keyboard event object
   * @returns {void}
   * @since 1.0.0
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Retrieves and updates monthly summary data for flat rate taxes.
   * 
   * @description Calls the flat rate service to get summary data for the current month and year,
   * including totals for each tax rate category. Updates the component's summary data and
   * triggers change detection to refresh the UI.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  summaryMonth() {
    this.flateRateService.summaryMonth(this.month(), this.year()).subscribe({
      next: (data: SummaryMonth) => {
        this.summaryMonthData = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  /**
   * Loads flat rate data and initializes the data source.
   * 
   * @description Comprehensive method that checks if the current month is closed,
   * retrieves monthly summary data, and sets up the data source for the data grid.
   * Creates an ASP.NET data store with proper configuration for loading, error handling,
   * and focus management.
   * 
   * @returns {void}
   * @example
   * ```typescript
   * this.getData(); // Refreshes all data and updates the grid
   * ```
   * @since 1.0.0
   */
  getData() {
    this.checkIfMonthIsClosed();
    this.summaryMonth();
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'ryczaltId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}flat-rate`,
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
   * Generates load parameters for the data source.
   * 
   * @description Creates an object containing the current month and year
   * to be used as parameters when loading data from the server.
   * 
   * @returns {any} Object containing month and year parameters
   * @example
   * ```typescript
   * const params = this.getLoadParams(); // { month: 12, year: 2024 }
   * ```
   * @since 1.0.0
   */
  getLoadParams() {
    let obj: any = {};
    obj.month = this.month();
    obj.year = this.year();
    return obj;
  }

  /**
   * Navigates to the previous month.
   * 
   * @description Decrements the current month by 1 if it's greater than 1 (January).
   * After changing the month, refreshes the data to show records for the new month.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  minusMonth() {
    if (this.month() > 1) {
      this.month.set(this.month() - 1);
    }
    this.getData();
  }

  /**
   * Navigates to the next month.
   * 
   * @description Increments the current month by 1 if it's less than 12 (December).
   * After changing the month, refreshes the data to show records for the new month.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  plusMonth() {
    if (this.month() < 12) {
      this.month.set(this.month() + 1);
    }
    this.getData();
  }

  /**
   * Navigates to the previous year.
   * 
   * @description Decrements the current year by 1 and refreshes the data
   * to show records for the new year.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  minusYear() {
    this.year.set(this.year() - 1);
    this.getData();
  }

  /**
   * Navigates to the next year.
   * 
   * @description Increments the current year by 1 and refreshes the data
   * to show records for the new year.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  plusYear() {
    this.year.set(this.year() + 1);
    this.getData();
  }

  /**
   * Checks if the current month is closed for editing.
   * 
   * @description Calls the flat rate service to determine if the current month
   * is closed for editing. Updates the component's isClosed signal based on the response.
   * This affects whether users can add, edit, or delete records.
   * 
   * @returns {void}
   * @since 1.0.0
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
   * Toggles the open/close status of the current month.
   * 
   * @description If the month is currently closed, it opens the month for editing.
   * If the month is currently open, it closes the month to prevent further editing.
   * After the operation, refreshes the data to reflect the new status.
   * 
   * @returns {void}
   * @since 1.0.0
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
   * Retrieves the currently focused data grid element.
   * 
   * @description Gets the data item that corresponds to the currently focused row
   * in the data grid by matching the focused row index with the data source items.
   * 
   * @returns {any} The focused data element or undefined if not found
   * @since 1.0.0
   */
  getFocusedElement() {
    return this.genericDataGrid.dataGrid.instance
      .getDataSource()
      .items()
      .find((_el: any, i: any) => this.focusedRowIndex === i);
  }

  /**
   * Initiates the process of adding a new flat rate record.
   * 
   * @description Sets the component mode to 'add' and opens the add record dialog.
   * Checks if the user session is active and if the current month is open for editing
   * before allowing the operation.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  addNewRecord() {
    this.mode = 'add';
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
  }

  /**
   * Handles double-click events on data grid rows.
   * 
   * @description When a user double-clicks on a row, this method triggers the edit mode
   * for the selected record. Currently includes commented code for potential dropdown mode handling.
   * 
   * @param {any} e - The double-click event object
   * @returns {void}
   * @since 1.0.0
   */
  onRowDblClick(e: any) {
    // if (this.dropDownBoxMode()) {
    //   return;
    // }

    this.onEdit();
  }

  /**
   * Initiates the process of editing the currently focused record.
   * 
   * @description Sets the component mode to 'edit' and opens the edit record dialog.
   * Updates the focused element and checks if the user session is active and
   * if the current month is open for editing before allowing the operation.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  onEdit() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Initiates the process of viewing the currently focused record.
   * 
   * @description Sets the component mode to 'show' and opens the view record dialog
   * in read-only mode. Updates the focused element to display the selected record's details.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Shows the delete confirmation dialog.
   * 
   * @description Checks if the user session is active and if the current month is open
   * for editing before showing the delete confirmation dialog for the focused record.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
  }

  /**
   * Closes the delete confirmation dialog.
   * 
   * @description Hides the delete confirmation dialog and returns focus to the data grid.
   * This method is called when the user cancels the delete operation.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Deletes the currently focused flat rate record.
   * 
   * @description Performs the actual deletion of the focused record after confirmation.
   * Checks if the user session is active and if the current month is open for editing.
   * If the record has an associated VAT register entry, prompts for VAT register deletion.
   * Reloads the data source and updates the monthly summary after successful deletion.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  delete() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().ryczaltId;
    this.vatRegisterId = this.getFocusedElement().vatRegisterId;

    this.flateRateService.delete(id).subscribe({
      next: () => {
        if(this.vatRegisterId != null && this.vatRegisterId !== 0){
          this.isConfirmDeleteVatRegister.set(true)
        }

        this.dataSource.reload().then(() => {
          this.focusedRowIndex = 0;
          this.summaryMonth();
        });
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  /**
   * Confirms the addition of a VAT register entry.
   * 
   * @description Closes the VAT register addition confirmation dialog and opens
   * the new VAT register form. This method is called when the user confirms
   * they want to add a VAT register entry for the flat rate record.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  yesAddVatRegister(){
    this.isAddVatRegister.set(false);
    this.isNewVatRegister.set(true);
  }

  /**
   * Handles the saving of a VAT register entry.
   * 
   * @description Closes the VAT register form and reloads the data source
   * after a VAT register entry has been successfully saved.
   * 
   * @param {any} e - The save event object
   * @returns {void}
   * @since 1.0.0
   */
  onSavingVatRegister(e: any){
    this.isNewVatRegister.set(false);
    this.dataSource.reload();
  }

  /**
   * Confirms the deletion of a VAT register entry.
   * 
   * @description Deletes the VAT register entry associated with the flat rate record.
   * This method is called when the user confirms they want to delete the VAT register entry.
   * 
   * @returns {void}
   * @since 1.0.0
   */
  yesDeleteVatRegister(){
    this.vatRegisterService.delete(this.vatRegisterId as number).subscribe();
  }

  /**
   * Handles the saving of a flat rate record.
   * 
   * @description Processes the save event from the flat rate form. Closes the add/edit dialog,
   * reloads the data source, updates the monthly summary, and manages focus on the saved record.
   * If the operation is 'add' and the user is a VAT payer, prompts for VAT register creation.
   * 
   * @param {any} event - The save event object containing mode, data, and flateRateId
   * @returns {void}
   * @since 1.0.0
   */
  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      this.summaryMonth();
      const index = data.findIndex(
        (x: any) => x.ryczaltId === Number(event.flateRateId.flateRateId)
      );
      if(event.mode === 'add'){
        this.paramsNumber = {
          number: event.data.documentNumber
        }
        event.data.ryczaltId = event.flateRateId.flateRateId;
        this.vatRegisterFlate =  event.data;

        if(this.event.sessionData.isVatPayer){
        this.isAddVatRegister.set(true);
        }
      }

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
   * Handles date range changes from the date range component.
   * 
   * @description Updates the current month and year based on the date range selection
   * and refreshes the data to show records for the new time period.
   * 
   * @param {Object} event - The date range change event
   * @param {number} event.month - The selected month (1-12)
   * @param {number} event.year - The selected year
   * @returns {void}
   * @since 1.0.0
   */
  onDateRangeChange(event: {month: number, year: number}) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }

}
