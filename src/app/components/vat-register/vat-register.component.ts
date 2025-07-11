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
import { Subscription } from 'rxjs';
import {
  VatRegister,
  SummaryMonthVatRegiser,
} from '../../interface/vatRegister';
import { PriceFormatPipe } from '../../pipe/currency';
import { NewVatRegisterComponent } from './new-vat-register/new-vat-register.component';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { VatRegisterService } from '../../services/vatRegister.service';
import { FlateRateService } from '../../services/flateRate.services';
import { sign } from 'crypto';
import { NewFlateRateComponent } from '../flate-rate/new-flate-rate/new-flate-rate.component';
import {
  OpenCloseRequest,
  CheckIfMonthIsClosed,
} from '../../interface/flateRate';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { DateRangeComponent } from '../date-range/date-range.component';
import { GenericGridColumn, GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

/**
 * VAT Register Component - Manages VAT sales register entries and operations
 * 
 * @description This component provides a comprehensive interface for managing VAT sales register entries.
 * It includes functionality for viewing, adding, editing, and deleting VAT register records with support
 * for month/year navigation, month closure status management, and related flat rate tax operations.
 * 
 * Key Features:
 * - Data grid with VAT register entries for selected month/year
 * - CRUD operations (Create, Read, Update, Delete) for VAT records
 * - Month/year navigation with closure status checks
 * - Integration with flat rate tax system
 * - Keyboard shortcuts for enhanced user experience
 * - Responsive design with device type detection
 * - Real-time data validation and error handling
 * 
 * @dependencies
 * - EventService: Global event and notification handling
 * - VatRegisterService: VAT register data operations
 * - FlateRateService: Flat rate tax operations and month closure management
 * - TranslateService: Internationalization support
 * - DevExtreme components: Data grid, buttons, and UI elements
 * 
 * @example
 * ```html
 * <app-vat-register></app-vat-register>
 * ```
 * 
 * @since 1.0.0
 */
@Component({
  selector: 'app-vat-register',
  standalone: true,
  imports: [
    DxButtonModule,
    DxoGridModule,
    DxTooltipModule,
    DxScrollViewModule,
    CommonModule,
    TranslateModule,
    DxDataGridModule,
    PriceFormatPipe,
    NewVatRegisterComponent,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    NewFlateRateComponent,
    DateRangeComponent,
    GenericDataGridComponent
  ],
  templateUrl: './vat-register.component.html',
  styleUrl: './vat-register.component.scss',
})
export class VatRegisterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('genericDataGrid') genericDataGrid: any;

  event = inject(EventService);
  cdr = inject(ChangeDetectorRef);
  vatRegisterService = inject(VatRegisterService);
  flateRateService = inject(FlateRateService);
  isClosed = signal<boolean>(false);
  mode: 'add' | 'edit' | 'show' = 'add';
  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = 'calc(100vh - 290px)';
  selectedRows: VatRegister[] = [];
  focusedRowIndex: number = 0;
  focusedElement = signal<VatRegister | null>(null);
  isAdd = signal<boolean>(false);
  pageSize: number = 50;
  isDelete = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];
  isConfirmDeleteFlateRate = signal<boolean>(false);
  ryczaltId: number | null = null;
  uri: string = 'registeVat/sell';
  paramsNumber: any;
  flatRegister: VatRegister | null = null;
  isAddFlateRegister = signal<boolean>(false);
  isNewFlateRegister = signal<boolean>(false);
  month = signal<number>(this.event.globalDate.month);
  year = signal<number>(this.event.globalDate.year);
  summaryMonthData: SummaryMonthVatRegiser = {
    TotalGrossSales: 0,
    Net23: 0,
    Vat23: 0,
    Net8: 0,
    Vat8: 0,
    Net5: 0,
    Vat5: 0,
    Net0: 0,
    Export0: 0,
    WDT0: 0,
    WSU: 0,
    ExemptSales: 0,
    ReverseCharge: 0,
    TotalNetSales: 0,
    TotalVat: 0,
  };

  private readonly translate = inject(TranslateService)
  private deviceTypeSubscription: Subscription | undefined;

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
          caption: this.translate.instant('flateRate.documentNumber'),
          dataField: 'documentNumber',
          width: 200,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant('vatRegister.documentDate'),
          dataField: 'documentDate',
          width: 200,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.datOFSell'),
          dataField: 'dateOfSell',
          width: 200,
          allowSorting: false,
          hidingPriority: 5, // Niski priorytet
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.customerName'),
          dataField: 'customerName',
          width: 300,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant('vatRegister.grossSalesValue'),
          dataField: 'grossSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 3, // Średni priorytet
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant('vatRegister.taxDue'),
          dataField: 'vatSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 6, // Najniższy priorytet
          customizeText: this.event.formatKwota,
        },
      ] as GenericGridColumn[]
  )

  /**
   * Constructor - Initializes the VatRegisterComponent
   * 
   * @description Creates a new instance of the VatRegisterComponent.
   * Dependencies are injected using Angular's inject() function.
   * 
   * @since 1.0.0
   */
  constructor() {}

  /**
   * Angular OnInit lifecycle hook - Initializes the component after construction
   * 
   * @description Performs initial component setup including data loading and device type subscription.
   * This method is called once after the component is constructed and all inputs are set.
   * 
   * @returns {void}
   * 
   * @example
   * Called automatically by Angular framework during component initialization
   * 
   * @since 1.0.0
   */
  ngOnInit() {
    this.getData();
    // Subskrybuj zmiany deviceType
    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  /**
   * Angular AfterViewInit lifecycle hook - Initializes view-dependent functionality
   * 
   * @description Sets up keyboard shortcuts and triggers change detection after the view is initialized.
   * This method is called after Angular initializes the component's view and child views.
   * 
   * Keyboard shortcuts configured:
   * - Alt + N: Add new record
   * - F2: Edit record (Shift + F2: Show record)
   * - Delete: Delete current record
   * 
   * @returns {void}
   * 
   * @example
   * Called automatically by Angular framework after view initialization
   * 
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
   * Checks if the current month is closed for VAT register operations
   * 
   * @description Queries the backend to determine if the currently selected month/year
   * is closed for editing. Sets the isClosed signal based on the response.
   * When a month is closed, users cannot add, edit, or delete VAT register entries.
   * 
   * @returns {void}
   * 
   * @example
   * this.checkIfMonthIsClosed(); // Updates isClosed signal
   * 
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
   * Loads VAT register data from the server
   * 
   * @description Initializes the data source for the VAT register grid by creating a new DataSource
   * with AspNetData store configuration. Also checks month closure status and loads summary data.
   * The data source is configured to load VAT register entries for the current month/year.
   * 
   * @returns {void}
   * 
   * @example
   * this.getData(); // Refreshes all data and reinitializes the grid
   * 
   * @since 1.0.0
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
   * Builds load parameters for data source requests
   * 
   * @description Creates an object containing the current month and year values
   * to be sent as parameters when loading VAT register data from the server.
   * 
   * @returns {Object} Object containing month and year parameters
   * @returns {number} obj.month - Current month (1-12)
   * @returns {number} obj.year - Current year
   * 
   * @example
   * const params = this.getLoadParams(); // { month: 3, year: 2024 }
   * 
   * @since 1.0.0
   */
  getLoadParams() {
    let obj: any = {};
    obj.month = this.month();
    obj.year = this.year();
    return obj;
  }

  /**
   * Decrements the current month by one
   * 
   * @description Decreases the current month by 1 if it's greater than 1 (January).
   * After changing the month, refreshes the data to load VAT register entries for the new month.
   * 
   * @returns {void}
   * 
   * @example
   * this.minusMonth(); // Changes from March to February and reloads data
   * 
   * @since 1.0.0
   */
  minusMonth() {
    if (this.month() > 1) {
      this.month.set(this.month() - 1);
    }
    this.getData();
  }

  /**
   * Increments the current month by one
   * 
   * @description Increases the current month by 1 if it's less than 12 (December).
   * After changing the month, refreshes the data to load VAT register entries for the new month.
   * 
   * @returns {void}
   * 
   * @example
   * this.plusMonth(); // Changes from March to April and reloads data
   * 
   * @since 1.0.0
   */
  plusMonth() {
    if (this.month() < 12) {
      this.month.set(this.month() + 1);
    }
    this.getData();
  }

  /**
   * Decrements the current year by one
   * 
   * @description Decreases the current year by 1 without any boundary checks.
   * After changing the year, refreshes the data to load VAT register entries for the new year.
   * 
   * @returns {void}
   * 
   * @example
   * this.minusYear(); // Changes from 2024 to 2023 and reloads data
   * 
   * @since 1.0.0
   */
  minusYear() {
    this.year.set(this.year() - 1);
    this.getData();
  }

  /**
   * Increments the current year by one
   * 
   * @description Increases the current year by 1 without any boundary checks.
   * After changing the year, refreshes the data to load VAT register entries for the new year.
   * 
   * @returns {void}
   * 
   * @example
   * this.plusYear(); // Changes from 2024 to 2025 and reloads data
   * 
   * @since 1.0.0
   */
  plusYear() {
    this.year.set(this.year() + 1);
    this.getData();
  }

  /**
   * Handles focused row change event in the data grid
   * 
   * @description Updates the focusedElement signal when the user selects a different row
   * in the data grid. This keeps track of the currently selected VAT register entry.
   * 
   * @param {any} event - The focused row change event from DevExtreme data grid
   * @param {any} event.row - The row object
   * @param {VatRegister} event.row.data - The VAT register data for the focused row
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically when user clicks on a different row
   * 
   * @since 1.0.0
   */
  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  /**
   * Handles keydown events in the data grid
   * 
   * @description Prevents default behavior for specific keys that have custom functionality
   * in the application. This ensures that the grid doesn't interfere with custom shortcuts.
   * 
   * @param {any} event - The keydown event from DevExtreme data grid
   * @param {KeyboardEvent} event.event - The original keyboard event
   * @param {string} event.event.key - The key that was pressed
   * 
   * @returns {void}
   * 
   * @example
   * // Automatically called when user presses keys in the grid
   * 
   * @since 1.0.0
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Handles double-click event on data grid rows
   * 
   * @description Triggers the edit mode when a user double-clicks on a row in the data grid.
   * This provides an intuitive way to edit VAT register entries.
   * 
   * @param {any} e - The double-click event from DevExtreme data grid
   * 
   * @returns {void}
   * 
   * @example
   * // Automatically called when user double-clicks on a row
   * 
   * @since 1.0.0
   */
  onRowDblClick(e: any) {
    // if (this.dropDownBoxMode()) {
    //   return;
    // }
    this.onEdit();
  }

  /**
   * Initiates edit mode for the currently focused VAT register entry
   * 
   * @description Sets the component to edit mode and opens the edit dialog for the currently
   * focused VAT register entry. Validates session activity and month closure status before proceeding.
   * 
   * @returns {void}
   * 
   * @example
   * this.onEdit(); // Opens edit dialog for selected VAT register entry
   * 
   * @since 1.0.0
   */
  onEdit() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Gets the data of the currently focused row in the data grid
   * 
   * @description Retrieves the VAT register data for the currently focused row in the data grid.
   * This is used to get the selected record for edit, show, or delete operations.
   * 
   * @returns {VatRegister} The VAT register data for the focused row
   * 
   * @example
   * const selectedRecord = this.getFocusedElement();
   * 
   * @since 1.0.0
   */
  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  /**
   * Initiates add mode for creating a new VAT register entry
   * 
   * @description Sets the component to add mode and opens the add dialog for creating a new
   * VAT register entry. Validates session activity and month closure status before proceeding.
   * 
   * @returns {void}
   * 
   * @example
   * this.addNewRecord(); // Opens add dialog for new VAT register entry
   * 
   * @since 1.0.0
   */
  addNewRecord() {
    this.mode = 'add';
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
  }

  /**
   * Initiates show mode for viewing a VAT register entry
   * 
   * @description Sets the component to show mode and opens the view dialog for the currently
   * focused VAT register entry. This mode displays the record in read-only format.
   * 
   * @returns {void}
   * 
   * @example
   * this.onShow(); // Opens view dialog for selected VAT register entry
   * 
   * @since 1.0.0
   */
  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Initiates delete confirmation for the currently focused VAT register entry
   * 
   * @description Shows a confirmation dialog before deleting the currently focused VAT register entry.
   * Validates session activity and month closure status before proceeding.
   * 
   * @returns {void}
   * 
   * @example
   * this.onDeleteConfirm(); // Shows delete confirmation dialog
   * 
   * @since 1.0.0
   */
  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
  }

  /**
   * Toggles the open/close status of the current month
   * 
   * @description Opens or closes the current month for VAT register operations based on its current status.
   * When a month is closed, no VAT register entries can be added, edited, or deleted.
   * After the operation, refreshes the data to reflect the new status.
   * 
   * @returns {void}
   * 
   * @example
   * this.onOpenClose(); // Opens closed month or closes open month
   * 
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
   * Handles the save operation completion for VAT register entries
   * 
   * @description Processes the save event after a VAT register entry is successfully saved.
   * Reloads the data source, updates the summary, and handles flat rate register creation if needed.
   * Also manages grid focus and triggers change detection.
   * 
   * @param {any} event - The save event object
   * @param {string} event.mode - The operation mode ('add' or 'edit')
   * @param {any} event.data - The saved VAT register data
   * @param {any} event.vatRegisterId - The VAT register ID information
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically when save operation completes
   * 
   * @since 1.0.0
   */
  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      this.summaryMonth();
      const index = data.findIndex(
        (x: any) =>
          x.vatRegisterId === Number(event.vatRegisterId.vatRegisterId)
      );

      if (event.mode === 'add' && this.uri === 'registeVat/sell') {
        this.paramsNumber = {
          number: event.data.documentNumber,
        };
        event.data.vatRegisterId = event.vatRegisterId.vatRegisterId;
        this.flatRegister = event.data;
        this.isAddFlateRegister.set(true);
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
   * Closes the delete confirmation dialog
   * 
   * @description Cancels the delete operation by closing the confirmation dialog
   * and returns focus to the data grid.
   * 
   * @returns {void}
   * 
   * @example
   * this.closeConfirm(); // Cancels delete operation and focuses grid
   * 
   * @since 1.0.0
   */
  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Deletes the currently focused VAT register entry
   * 
   * @description Executes the delete operation for the currently focused VAT register entry.
   * Validates session activity and month closure status before proceeding. If the entry
   * has an associated flat rate record, prompts for its deletion as well.
   * 
   * @returns {void}
   * 
   * @example
   * this.delete(); // Deletes the selected VAT register entry
   * 
   * @since 1.0.0
   */
  delete() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().vatRegisterId;
    this.ryczaltId = this.getFocusedElement().ryczaltId;
    this.vatRegisterService.delete(id).subscribe({
      next: () => {
        if (this.ryczaltId != null && this.ryczaltId !== 0) {
          this.isConfirmDeleteFlateRate.set(true);
        }

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
   * Confirms the creation of a new flat rate register entry
   * 
   * @description Closes the flat rate register creation confirmation dialog and
   * opens the flat rate register creation form. This is typically called after
   * a VAT register entry is created to create a corresponding flat rate entry.
   * 
   * @returns {void}
   * 
   * @example
   * this.yesAddFlateRegister(); // Confirms and opens flat rate register form
   * 
   * @since 1.0.0
   */
  yesAddFlateRegister() {
    this.isAddFlateRegister.set(false);
    this.isNewFlateRegister.set(true);
  }

  /**
   * Confirms the deletion of the associated flat rate register entry
   * 
   * @description Closes the flat rate deletion confirmation dialog and
   * executes the deletion of the flat rate register entry associated with
   * the deleted VAT register entry.
   * 
   * @returns {void}
   * 
   * @example
   * this.yesDeleteFlateRate(); // Confirms and deletes associated flat rate entry
   * 
   * @since 1.0.0
   */
  yesDeleteFlateRate() {
    this.isConfirmDeleteFlateRate.set(false);
    this.flateRateService.delete(this.ryczaltId as number).subscribe();
  }

  /**
   * Handles the completion of flat rate register entry save operation
   * 
   * @description Closes the flat rate register creation form and reloads the
   * VAT register data source to reflect any changes. This ensures the grid
   * displays updated information after the flat rate entry is saved.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically when flat rate register save completes
   * 
   * @since 1.0.0
   */
  onSavingFlate() {
    this.isNewFlateRegister.set(false);
    this.dataSource.reload();
  }

  /**
   * Loads the monthly summary data for VAT register entries
   * 
   * @description Retrieves and updates the monthly summary statistics for VAT register entries
   * including total sales, VAT amounts by rate, and other summary information for the current
   * month and year. The summary data is stored in the summaryMonthData property.
   * 
   * @returns {void}
   * 
   * @example
   * this.summaryMonth(); // Loads summary data for current month/year
   * 
   * @since 1.0.0
   */
  summaryMonth() {
    this.vatRegisterService.summaryMonth(this.month(), this.year()).subscribe({
      next: (data: SummaryMonthVatRegiser) => {
        this.summaryMonthData = data;
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  /**
   * Handles date range change events from the date range component
   * 
   * @description Updates the current month and year based on the date range selection
   * and refreshes the data to load VAT register entries for the new date range.
   * 
   * @param {Object} event - The date range change event
   * @param {number} event.month - The new month (1-12)
   * @param {number} event.year - The new year
   * 
   * @returns {void}
   * 
   * @example
   * this.onDateRangeChange({ month: 5, year: 2024 }); // Changes to May 2024
   * 
   * @since 1.0.0
   */
  onDateRangeChange(event: {month: number, year: number}) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }


  /**
   * Angular OnDestroy lifecycle hook - Cleanup when component is destroyed
   * 
   * @description Performs cleanup operations when the component is being destroyed.
   * Unsubscribes from device type change subscription to prevent memory leaks.
   * 
   * @returns {void}
   * 
   * @example
   * Called automatically by Angular framework when component is destroyed
   * 
   * @since 1.0.0
   */
  ngOnDestroy() {
    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();
    }
  }
}
