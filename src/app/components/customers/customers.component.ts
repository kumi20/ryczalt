import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  input,
  signal,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  Input,
  computed
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppServices } from '../../services/app-services.service';
import { EventService } from '../../services/event-services.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import {
  DxDataGridModule,
  DxDropDownBoxModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomChipsButtonComponent } from '../core/custom-chips-button/custom-chips-button.component';
import { Customer } from '../../interface/customers';
import { FilterCriteria } from '../../interface/filterCriteria';
import { CustomDropdownBoxComponent } from '../core/custom-dropdown-box/custom-dropdown-box.component';
import { NewCustomerComponent } from './new-customer/new-customer.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { CustomerService } from '../../services/customer.service';
import { GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericGridColumn } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';


/**
 * CustomersComponent is a comprehensive data grid component for managing customer records.
 * It provides functionality for viewing, adding, editing, and deleting customer information.
 * 
 * @description This component handles customer data with features including:
 * - Data grid with sorting, filtering, and pagination
 * - Dropdown box mode for customer selection
 * - CRUD operations (Create, Read, Update, Delete)
 * - Keyboard shortcuts for quick actions
 * - Real-time search and filtering
 * - Customer type filtering (Supplier, Recipient, Office)
 * 
 * @dependencies
 * - AppServices: Core application services
 * - CustomerService: Customer-specific business logic
 * - EventService: Event handling and session management
 * - TranslateService: Internationalization support
 * - DevExtreme components: Data grid and UI components
 * 
 * @usage
 * ```html
 * <app-customers [dropDownBoxMode]="false" [className]="true" [readOnly]="false"></app-customers>
 * ```
 * 
 * @since 1.0.0
 */
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TranslateModule,
    CustomDropdownBoxComponent,
    CustomChipsButtonComponent,
    NewCustomerComponent,
    DxButtonModule,
    NgShortcutsComponent,
    DxTooltipModule,
    ConfirmDialogComponent,
    DxScrollViewModule,
    DxDropDownBoxModule,
    GenericDataGridComponent
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  /**
   * Reference to the generic data grid component
   * @type {any}
   * @description ViewChild reference to the main data grid component for programmatic access
   * @since 1.0.0
   */
  @ViewChild('genericDataGrid', { static: false }) genericDataGrid: any;
  
  /**
   * Reference to the dropdown grid component
   * @type {any}
   * @description ViewChild reference to the dropdown grid used in selection mode
   * @since 1.0.0
   */
  @ViewChild('gridDropDown') gridDropDown: any;
  
  /**
   * Reference to the contractors dropdown box component
   * @type {any}
   * @description ViewChild reference to the contractors dropdown box for search functionality
   * @since 1.0.0
   */
  @ViewChild('contractorsBox') contractorsBox: any;
  
  /**
   * Event emitted when a customer is selected in dropdown mode
   * @type {EventEmitter<Customer>}
   * @description Emits the selected customer data to parent components
   * @example
   * ```html
   * <app-customers (onChoosed)="handleCustomerSelection($event)"></app-customers>
   * ```
   * @since 1.0.0
   */
  @Output() onChoosed = new EventEmitter();
  
  /**
   * Read-only mode flag
   * @type {boolean}
   * @description Determines if the component is in read-only mode
   * @default false
   * @example
   * ```html
   * <app-customers [readOnly]="true"></app-customers>
   * ```
   * @since 1.0.0
   */
  @Input() readOnly: boolean = false;

  /**
   * Dropdown box mode input signal
   * @type {InputSignal<boolean>}
   * @description Determines if the component should display as a dropdown selector
   * @default false
   * @example
   * ```html
   * <app-customers [dropDownBoxMode]="true"></app-customers>
   * ```
   * @since 1.0.0
   */
  dropDownBoxMode = input<boolean>(false);
  
  /**
   * CSS class name input signal
   * @type {InputSignal<boolean | null | undefined>}
   * @description Controls CSS class application for styling
   * @default false
   * @since 1.0.0
   */
  className = input<boolean | null | undefined>(false);
  
  /**
   * DevExtreme data source for the grid
   * @type {DataSource}
   * @description Main data source configured with server-side processing for the customers grid
   * @since 1.0.0
   */
  dataSource: DataSource = new DataSource({});
  
  /**
   * Form control name input signal
   * @type {InputSignal<number | null>}
   * @description The ID of the selected customer for dropdown mode
   * @default null
   * @example
   * ```html
   * <app-customers [controlNameForm]="selectedCustomerId"></app-customers>
   * ```
   * @since 1.0.0
   */
  controlNameForm = input<number | null>(null);

  /**
   * Application services instance
   * @type {AppServices}
   * @description Core application services for API communication
   * @since 1.0.0
   */
  appServices = inject(AppServices);
  
  /**
   * Customer services instance
   * @type {CustomerService}
   * @description Service for customer-specific business logic and API calls
   * @since 1.0.0
   */
  customerServices = inject(CustomerService);
  
  /**
   * Event service instance
   * @type {EventService}
   * @description Service for handling global events and notifications
   * @since 1.0.0
   */
  event = inject(EventService);
  
  /**
   * Translation service instance
   * @type {TranslateService}
   * @description Service for handling internationalization and translations
   * @since 1.0.0
   */
  translate = inject(TranslateService);
  
  /**
   * Change detector reference
   * @type {ChangeDetectorRef}
   * @description Reference for manually triggering change detection
   * @since 1.0.0
   */
  cdr = inject(ChangeDetectorRef);

  /**
   * Grid height configuration
   * @type {number | string}
   * @description Height of the grid, can be a number or CSS string
   * @default 'calc(100vh - 150px)'
   * @since 1.0.0
   */
  heightGrid: number | string = 'calc(100vh - 150px)';
  
  /**
   * Selected rows array
   * @type {Customer[]}
   * @description Array of currently selected customer records
   * @default []
   * @since 1.0.0
   */
  selectedRows: Customer[] = [];
  
  /**
   * Focused row index in the grid
   * @type {number}
   * @description Index of the currently focused row in the grid
   * @default 0
   * @since 1.0.0
   */
  focusedRowIndex: number = 0;

  /**
   * Page size for grid pagination
   * @type {number}
   * @description Number of rows to display per page
   * @default 50
   * @since 1.0.0
   */
  pageSize: number = 50;
  
  /**
   * Current form mode
   * @type {'add' | 'edit' | 'show'}
   * @description Current mode of the customer form (add new, edit existing, or view)
   * @default 'add'
   * @since 1.0.0
   */
  mode: 'add' | 'edit' | 'show' = 'add';

  /**
   * Current filter value
   * @type {string}
   * @description Current filter value entered by the user
   * @default ''
   * @since 1.0.0
   */
  filterValue: string = '';
  
  /**
   * Filter criteria configuration
   * @type {FilterCriteria[]}
   * @description Array of available filter criteria for the search dropdown
   * @default [customerName, city, customerVat]
   * @since 1.0.0
   */
  filterCriteria: FilterCriteria[] = [
    {
      value: 'customerName',
      label: this.translate.instant('customers.customerName'),
    },
    {
      value: 'city',
      label: this.translate.instant('customers.city'),
    },
    {
      value: 'customerVat',
      label: 'NIP',
    },
  ];
  
  /**
   * Order by field signal
   * @type {WritableSignal<string>}
   * @description Reactive signal for the current sort column
   * @default 'customerName'
   * @since 1.0.0
   */
  orderBy = signal<string>('customerName');
  
  /**
   * Sort order signal
   * @type {WritableSignal<string>}
   * @description Reactive signal for the current sort order (ASC/DESC)
   * @default 'ASC'
   * @since 1.0.0
   */
  order = signal<string>('ASC');

  /**
   * Customer type filter options
   * @type {FilterCriteria[]}
   * @description Array of customer type filter options (Supplier, Recipient, Office)
   * @since 1.0.0
   */
  filterOptions: FilterCriteria[] = [
    { label: this.translate.instant('customers.isSupplier'), value: 0 },
    { label: this.translate.instant('customers.isRecipient'), value: 1 },
    { label: this.translate.instant('customers.isOffice'), value: 2 },
  ];
  
  /**
   * Delete filter signal
   * @type {WritableSignal<boolean>}
   * @description Reactive signal for showing/hiding deleted records
   * @default true
   * @since 1.0.0
   */
  deleteFilter = signal<boolean>(true);
  
  /**
   * Customer type filter value
   * @type {null | 0 | 1 | 2}
   * @description Current customer type filter (null=all, 0=Supplier, 1=Recipient, 2=Office)
   * @default null
   * @since 1.0.0
   */
  typeFilter: null | 0 | 1 | 2 = null;
  
  /**
   * Add/Edit form visibility signal
   * @type {WritableSignal<boolean>}
   * @description Reactive signal controlling the visibility of the add/edit form
   * @default false
   * @since 1.0.0
   */
  isAdd = signal<boolean>(false);

  /**
   * Keyboard shortcuts configuration
   * @type {ShortcutInput[]}
   * @description Array of keyboard shortcuts for quick actions
   * @default []
   * @since 1.0.0
   */
  shortcuts: ShortcutInput[] = [];
  
  /**
   * Delete confirmation dialog visibility signal
   * @type {WritableSignal<boolean>}
   * @description Reactive signal controlling the visibility of the delete confirmation dialog
   * @default false
   * @since 1.0.0
   */
  isDelete = signal<boolean>(false);
  
  /**
   * Focused element signal
   * @type {WritableSignal<Customer | null>}
   * @description Reactive signal containing the currently focused customer record
   * @default null
   * @since 1.0.0
   */
  focusedElement = signal<Customer | null>(null);
  
  /**
   * Grid dropdown open state
   * @type {boolean}
   * @description Indicates if the dropdown grid is currently open
   * @default false
   * @since 1.0.0
   */
  isGridBoxOpened: boolean = false;

  /**
   * Currently selected customer ID
   * @type {null | number}
   * @description ID of the currently selected customer in dropdown mode
   * @default null
   * @since 1.0.0
   */
  chossingRecord: null | number = null;
  
  /**
   * Dropdown data source
   * @type {Customer[]}
   * @description Array of customer data for dropdown mode
   * @default []
   * @since 1.0.0
   */
  dataSourceDropDown: Customer[] = [];
  
  /**
   * Search timer for debouncing
   * @type {any}
   * @description Timer reference for debouncing search input
   * @since 1.0.0
   */
  searchTimer: any;
  
  /**
   * Search key for filtering
   * @type {string}
   * @description Current search key for filtering customers
   * @default ''
   * @since 1.0.0
   */
  SearchKey: string = '';

  /**
   * Grid options configuration
   * @type {Signal<GenericGridOptions>}
   * @description Computed signal containing configuration options for the customers grid
   * @description Includes height, column hiding, and column chooser settings
   * @since 1.0.0
   */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 150px)",
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
   * Grid columns configuration
   * @type {Signal<GenericGridColumn[]>}
   * @description Computed signal containing column definitions for the customers grid
   * @description Includes customer name, VAT number, address, contact info, and type flags
   * @since 1.0.0
   */
  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant('customers.customerName'),
          dataField: 'customerName',
          width: 400,
          minWidth: 200,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 1, // Najwyższy priorytet
        },
        {
          caption: 'NIP',
          dataField: 'customerVat',
          width: 150,
          minWidth: 120,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 2, // Wysoki priorytet
        },
        {
          caption: this.translate.instant('customers.street'),
          dataField: 'street',
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 5, // Niski priorytet
        },
        {
          caption: this.translate.instant('customers.city'),
          dataField: 'city',
          width: 150,
          minWidth: 120,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 3, // Średni priorytet
        },
        {
          caption: this.translate.instant('customers.postalCode'),
          dataField: 'postalCode',
          width: 150,
          minWidth: 100,
          allowSorting: false,
          hidingPriority: 6, // Najniższy priorytet
        },
        {
          caption: this.translate.instant('customers.email'),
          dataField: 'email',
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 7, // Bardzo niski priorytet
        },
        {
          caption: this.translate.instant('customers.phone'),
          dataField: 'phone',
          width: 150,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 8, // Bardzo niski priorytet
        },
        {
          caption: this.translate.instant('customers.isSupplier'),
          dataField: 'isSupplier',
          width: 100,
          minWidth: 80,
          allowSorting: false,
          hidingPriority: 4, // Średni priorytet
          encodeHtml: false,
          dataType: 'string',
          customizeText: (e: any) => {
            return e.value ? `<img src="../../../assets/images/check-solid.svg" alt="" width="14" />` : '';
          }
        },
        {
          caption: this.translate.instant('customers.isRecipient'),
          dataField: 'isRecipient',
          width: 100,
          minWidth: 80,
          allowSorting: false,
          hidingPriority: 9, // Niski priorytet
          encodeHtml: false,
          dataType: 'string',
          customizeText: (e: any) => {
            return e.value ? `<img src="../../../assets/images/check-solid.svg" alt="" width="14" />` : '';
          }
        },
        {
          caption: this.translate.instant('customers.isOffice'),
          dataField: 'isOffice',
          width: 100,
          minWidth: 80,
          allowSorting: false,
          hidingPriority: 10, // Najniższy priorytet
          encodeHtml: false,
          dataType: 'string',
          customizeText: (e: any) => {
            return e.value ? `<img src="../../../assets/images/check-solid.svg" alt="" width="14" />` : ''; 
          }
        }
      ] as GenericGridColumn[]
  );

  /**
   * Constructor for CustomersComponent
   * 
   * @description Initializes the component with default values
   * @since 1.0.0
   */
  constructor() {}

  /**
   * Angular lifecycle hook - component initialization
   * 
   * @description Initializes the component and loads customer data
   * Called once, after the first ngOnChanges
   * 
   * @returns {void}
   * @since 1.0.0
   */
  ngOnInit(): void {
    this.getData();
  }

  /**
   * Angular lifecycle hook - handles input property changes
   * 
   * @description Responds to changes in component input properties,
   * specifically handling controlNameForm changes in dropdown mode
   * 
   * @param {SimpleChanges} changes - Object containing changed properties
   * @returns {void}
   * @since 1.0.0
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['controlNameForm'] && this.dropDownBoxMode()) {
      this.chossingRecord = changes['controlNameForm'].currentValue;

      if (this.chossingRecord !== null) {
        this.customerServices
          .getCustomerById(this.chossingRecord)
          .subscribe((data) => {
            this.dataSourceDropDown = data;
            this.cdr.detectChanges();
          });
      }
    }
  }

  /**
   * Angular lifecycle hook - after view initialization
   * 
   * @description Initializes keyboard shortcuts and triggers change detection
   * Called once after ngAfterContentInit and after the first ngAfterContentChecked
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
   * Initializes and configures the data source for the customers grid
   * 
   * @description Creates a DevExtreme DataSource with AspNetData store
   * for server-side data processing including filtering, sorting, and pagination
   * 
   * @returns {void}
   * @example
   * ```typescript
   * this.getData(); // Refreshes the grid data
   * ```
   * @since 1.0.0
   */
  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'customerId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}customers`,
        loadParams: this.getLoadParams(),
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        onLoaded: () => {
          setTimeout(() => {
            this.genericDataGrid.focus();
          }, 0);
        },
      }),
    });
  }

  /**
   * Builds load parameters for server-side data requests
   * 
   * @description Constructs query parameters based on current filter state,
   * sorting preferences, and search criteria
   * 
   * @returns {any} Object containing query parameters for API request
   * @example
   * ```typescript
   * const params = this.getLoadParams();
   * // Returns: { orderBy: 'customerName', order: 'ASC', customerName: 'John' }
   * ```
   * @since 1.0.0
   */
  getLoadParams() {
    let obj: any = {};
    obj.orderBy = this.orderBy();
    obj.order = this.order();

    switch (this.orderBy()) {
      case 'customerName':
        obj['customerName'] = this.filterValue;
        break;
      case 'city':
        obj['city'] = this.filterValue;
        break;
      case 'customerVat':
        obj['customerVat'] = this.filterValue;
        break;
    }

    switch (this.typeFilter) {
      case 0:
        obj['isSupplier'] = true;
        break;
      case 1:
        obj['isRecipient'] = true;
        break;
      case 2:
        obj['isOffice'] = true;
        break;
    }

    if(this.SearchKey !== ''){
      obj['customerName'] = this.SearchKey;
    }
    return obj;
  }

  /**
   * Handles changes to the filter dropdown selection
   * 
   * @description Updates filter criteria and reloads data when user selects
   * a different filter option from the dropdown
   * 
   * @param {any} event - Filter change event containing selectedItem and filterValue
   * @returns {void}
   * @since 1.0.0
   */
  onFilterDataChanged(event: any) {
    if (event.selectedItem) {
      this.filterValue = event.filterValue;
      this.orderBy.set(event.selectedItem.value);
      this.getData();
    }
  }

  /**
   * Sets search criteria and toggles sort order
   * 
   * @description Sets the column to order by, or toggles sort direction
   * if the same column is clicked again
   * 
   * @param {string} orderBy - Column name to order by
   * @returns {void}
   * @example
   * ```typescript
   * this.setSearchCriteria('customerName'); // Sets ordering by customer name
   * this.setSearchCriteria('customerName'); // Toggles ASC/DESC if already sorting by name
   * ```
   * @since 1.0.0
   */
  setSearchCriteria(orderBy: string) {
    if (orderBy !== this.orderBy()) {
      this.orderBy.set(orderBy);
    } else {
      this.switchOrder();
    }
    this.getData();
  }

  /**
   * Toggles the sort order between ascending and descending
   * 
   * @description Switches the current sort order from ASC to DESC or vice versa
   * 
   * @returns {void}
   * @example
   * ```typescript
   * this.switchOrder(); // Changes ASC to DESC or DESC to ASC
   * ```
   * @since 1.0.0
   */
  switchOrder() {
    if (this.order() === 'ASC') {
      this.order.set('DESC');
      return;
    }

    this.order.set('ASC');
  }

  /**
   * Handles customer type filter changes
   * 
   * @description Updates the customer type filter (Supplier, Recipient, Office)
   * and reloads the data grid
   * 
   * @param {any} event - Filter value: 0 (Supplier), 1 (Recipient), 2 (Office), or '' (All)
   * @returns {void}
   * @since 1.0.0
   */
  onValueChangedFilterType(event: any) {
    this.typeFilter = event === '' ? null : event;
    this.getData();
  }

  /**
   * Initiates adding a new customer record
   * 
   * @description Opens the new customer form in add mode
   * Checks session validity before proceeding
   * 
   * @returns {void}
   * @example
   * ```typescript
   * this.addNewRecord(); // Opens new customer form
   * ```
   * @since 1.0.0
   */
  addNewRecord() {
    if (!this.event.sessionData.isActive) return;
    this.mode = 'add';
    this.isAdd.set(true);
  }

  /**
   * Handles successful customer save operation
   * 
   * @description Closes the add/edit form, reloads data, and focuses on the saved record
   * 
   * @param {any} event - Save event containing customerId of the saved record
   * @returns {void}
   * @since 1.0.0
   */
  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      const index = data.findIndex(
        (x: any) => x.customerId == Number(event.customerId)
      );

      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }

      this.cdr.detectChanges();
    });
  }

  /**
   * Shows delete confirmation dialog
   * 
   * @description Displays confirmation dialog before deleting a customer record
   * Checks session validity before proceeding
   * 
   * @returns {void}
   * @since 1.0.0
   */
  onDeleteConfirm() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(true);
  }

  /**
   * Closes the delete confirmation dialog
   * 
   * @description Hides the confirmation dialog and returns focus to the grid
   * 
   * @returns {void}
   * @since 1.0.0
   */
  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Gets the currently focused row data
   * 
   * @description Returns the data object of the currently focused grid row
   * 
   * @returns {Customer} The customer data from the focused row
   * @since 1.0.0
   */
  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  /**
   * Deletes the currently focused customer record
   * 
   * @description Performs the actual deletion of the customer record
   * after confirmation, then reloads the grid data
   * 
   * @returns {void}
   * @since 1.0.0
   */
  delete() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().customerId;

    this.customerServices.deleteCustomer(id).subscribe(() => {
      this.dataSource.reload().then(() => {
        this.focusedRowIndex = 0;
      });
    });
  }

  /**
   * Handles grid row focus change events
   * 
   * @description Updates the focused element signal when user navigates to a different row
   * 
   * @param {any} event - Focus change event containing row data
   * @returns {void}
   * @since 1.0.0
   */
  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  /**
   * Opens the edit form for the currently focused customer
   * 
   * @description Sets the component to edit mode and opens the customer form
   * with the focused customer's data for editing
   * 
   * @returns {void}
   * @since 1.0.0
   */
  onEdit() {
    if (!this.event.sessionData.isActive) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Opens the view form for the currently focused customer
   * 
   * @description Sets the component to show mode (read-only) and displays
   * the focused customer's data
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
   * Handles keyboard events in the grid
   * 
   * @description Prevents default behavior for specific keys that are handled
   * by custom keyboard shortcuts
   * 
   * @param {any} event - Keyboard event object
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
   * Handles double-click events on grid rows
   * 
   * @description In dropdown mode, selects the clicked record.
   * In normal mode, opens the edit form for the clicked customer
   * 
   * @param {any} e - Double-click event containing row data
   * @returns {void}
   * @since 1.0.0
   */
  onRowDblClick(e: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(e.data);
      return;
    }

    this.onEdit();
  }

  /**
   * Handles customer selection in dropdown mode
   * 
   * @description Selects a customer record when used as a dropdown,
   * emits the selection event and closes the dropdown
   * 
   * @param {Customer} e - Selected customer record
   * @returns {void}
   * @since 1.0.0
   */
  onChoosingRecord = (e: Customer) => {
    if (this.event.sessionData.isActive) {
      this.dataSourceDropDown = [e];
      this.chossingRecord = e.customerId;
      this.onChoosed.emit(e);
      this.isGridBoxOpened = false;
      this.SearchKey = '';
    }
  };

  /**
   * Handles dropdown box open/close state changes
   * 
   * @description When dropdown opens, focuses the grid and loads data.
   * When closed, resets the opened state
   * 
   * @param {any} e - Boolean indicating if dropdown is opened
   * @returns {void}
   * @since 1.0.0
   */
  onOpenedChanged(e: any) {
    if (e) {
      try {
        setTimeout(() => {
          this.gridDropDown.instance.focus();
        }, 500);
      } catch {}
      this.getData();
    } else {
      this.isGridBoxOpened = false;
    }
  }

  /**
   * Handles dropdown value changes
   * 
   * @description Emits null when dropdown value is cleared
   * 
   * @param {any} e - Value change event
   * @returns {void}
   * @since 1.0.0
   */
  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
    }
  };

  /**
   * Handles input events in the dropdown search box
   * 
   * @description Implements debounced search functionality with 500ms delay
   * to avoid excessive API calls during typing
   * 
   * @returns {void}
   * @since 1.0.0
   */
  grid_onInput(){
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.SearchKey = this.contractorsBox.text;
      this.getData();
      this.isGridBoxOpened = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.contractorsBox?.instance?.focus();
      }, 500);
    }, 500);
  }

  /**
   * Handles column header click events for sorting
   * 
   * @description Updates the orderBy field when a column header is clicked
   * 
   * @param {any} event - Column header click event containing column field name
   * @returns {void}
   * @since 1.0.0
   */
  onColumnHeaderClick(event: any) {
    this.orderBy.set(event);
  }

  /**
   * Handles sort order button clicks
   * 
   * @description Updates the sort order (ASC/DESC) and reloads data
   * 
   * @param {any} event - Sort order value ('ASC' or 'DESC')
   * @returns {void}
   * @since 1.0.0
   */
  onOrderClick(event: any) {
    this.order.set(event);
    this.getData();
  }

  /**
   * Gets customer type abbreviations as a string
   * 
   * @description Generates a comma-separated string of customer type abbreviations
   * (S for Supplier, R for Recipient, O for Office)
   * 
   * @param {any} customer - Customer object with type flags
   * @returns {string} Comma-separated string of type abbreviations
   * @example
   * ```typescript
   * const types = this.getCustomerTypeIcon(customer);
   * // Returns: "S, R" for a customer that is both Supplier and Recipient
   * ```
   * @since 1.0.0
   */
  getCustomerTypeIcon(customer: any): string {
    const types = [];
    if (customer.isSupplier) types.push('S');
    if (customer.isRecipient) types.push('R');
    if (customer.isOffice) types.push('O');
    return types.join(', ');
  }

  /**
   * Angular lifecycle hook - component destruction
   * 
   * @description Cleanup method called when component is destroyed
   * Currently no cleanup required, but method is implemented for future use
   * 
   * @returns {void}
   * @since 1.0.0
   */
  ngOnDestroy(): void {}
}
