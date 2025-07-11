import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  computed,
  signal,
} from "@angular/core";
import { Subscription } from "rxjs";
import { DxDataGridModule, DxDropDownBoxModule } from "devextreme-angular";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import DataSource from "devextreme/data/data_source";
import { EventService } from "../../services/event-services.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { Office } from "../../interface/office";
import { AppServices } from "../../services/app-services.service";
import {
  GenericGridColumn,
  GenericGridOptions,
} from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";
import { CustomDropdownBoxComponent } from "../core/custom-dropdown-box/custom-dropdown-box.component";
import { FilterCriteria } from '../../interface/filterCriteria';

/**
 * Tax Office management component for selecting and managing tax office data.
 * 
 * This component provides functionality for browsing, filtering, and selecting tax offices.
 * It supports both standalone grid view and dropdown selection modes with search capabilities.
 * 
 * @example
 * ```html
 * <!-- Standalone tax office grid -->
 * <app-office></app-office>
 * 
 * <!-- Dropdown selector -->
 * <app-office [dropDownBoxMode]="true" [controlNameForm]="selectedOfficeId" (onChoosed)="onOfficeSelected($event)"></app-office>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
@Component({
  selector: "app-office",
  imports: [
    DxDataGridModule,
    TranslateModule,
    CommonModule,
    DxDropDownBoxModule,
    GenericDataGridComponent,
    CustomDropdownBoxComponent,
  ],
  templateUrl: "./office.component.html",
  styleUrl: "./office.component.scss",
})
export class OfficeComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Reference to the generic data grid component
   * @type {any}
   * @description ViewChild reference to the main data grid component for programmatic access
   * @since 1.0.0
   */
  @ViewChild("genericDataGrid") genericDataGrid: any;
  
  /**
   * Reference to the contractors dropdown box component
   * @type {any}
   * @description ViewChild reference to the contractors dropdown box for search functionality
   * @since 1.0.0
   */
  @ViewChild("contractorsBox") contractorsBox: any;
  
  /**
   * Event emitted when a tax office is selected
   * @type {EventEmitter<Office>}
   * @description Emits the selected tax office data to parent components
   * @example
   * ```html
   * <app-office (onChoosed)="handleOfficeSelection($event)"></app-office>
   * ```
   * @since 1.0.0
   */
  @Output() onChoosed = new EventEmitter();
  
  /**
   * Reference to the dropdown grid component
   * @type {any}
   * @description ViewChild reference to the dropdown grid used in selection mode
   * @since 1.0.0
   */
  @ViewChild("gridDropDown") gridDropDown: any;
  
  /**
   * CSS class name input signal
   * @type {InputSignal<boolean>}
   * @description Controls CSS class application for styling
   * @default false
   * @since 1.0.0
   */
  className = input<boolean>(false);
  
  /**
   * Read-only mode flag
   * @type {boolean}
   * @description Determines if the component is in read-only mode
   * @default false
   * @example
   * ```html
   * <app-office [readOnly]="true"></app-office>
   * ```
   * @since 1.0.0
   */
  @Input() readOnly: boolean = false;
  
  /**
   * DevExtreme data source for the grid
   * @type {DataSource}
   * @description Main data source configured with server-side processing for the tax offices grid
   * @since 1.0.0
   */
  dataSource: DataSource = new DataSource({});
  
  /**
   * Event service instance
   * @type {EventService}
   * @description Service for handling global events and notifications
   * @since 1.0.0
   */
  event = inject(EventService);
  
  /**
   * Grid height configuration
   * @type {number | string}
   * @description Height of the grid, can be a number or CSS string
   * @default 'calc(100vh - 220px)'
   * @since 1.0.0
   */
  heightGrid: number | string = "calc(100vh - 220px)";
  
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
   * @default 200
   * @since 1.0.0
   */
  pageSize: number = 200;

  /**
   * Dropdown box mode input signal
   * @type {InputSignal<boolean>}
   * @description Determines if the component should display as a dropdown selector
   * @default false
   * @example
   * ```html
   * <app-office [dropDownBoxMode]="true"></app-office>
   * ```
   * @since 1.0.0
   */
  dropDownBoxMode = input<boolean>(false);

  /**
   * Application services instance
   * @type {AppServices}
   * @description Core application services for API communication
   * @since 1.0.0
   */
  appServices = inject(AppServices);
  
  /**
   * Change detector reference
   * @type {ChangeDetectorRef}
   * @description Reference for manually triggering change detection
   * @since 1.0.0
   */
  cdr = inject(ChangeDetectorRef);
  
  /**
   * Device type change subscription
   * @type {Subscription | undefined}
   * @description Subscription to device type changes for responsive behavior
   * @since 1.0.0
   */
  private deviceTypeSubscription?: Subscription;

  /**
   * Currently selected office ID
   * @type {null | number}
   * @description ID of the currently selected tax office in dropdown mode
   * @default null
   * @since 1.0.0
   */
  chossingRecord: null | number = null;
  
  /**
   * Grid dropdown open state
   * @type {boolean}
   * @description Indicates if the dropdown grid is currently open
   * @default false
   * @since 1.0.0
   */
  isGridBoxOpened: boolean = false;
  
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
   * @description Current search key for filtering tax offices
   * @default ''
   * @since 1.0.0
   */
  SearchKey: string = "";
  
  /**
   * Form control name input signal
   * @type {InputSignal<any>}
   * @description The value of the form control for dropdown mode
   * @default null
   * @example
   * ```html
   * <app-office [controlNameForm]="selectedOfficeId"></app-office>
   * ```
   * @since 1.0.0
   */
  controlNameForm = input<any>(null);
  
  /**
   * Dropdown data source
   * @type {any[]}
   * @description Array of tax office data for dropdown mode
   * @default []
   * @since 1.0.0
   */
  dataSourceDropDown: any[] = [];
  
  /**
   * Translation service instance
   * @type {TranslateService}
   * @description Service for handling internationalization and translations
   * @since 1.0.0
   */
  translate = inject(TranslateService);

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
   * @default [name, city, address, voivodeship]
   * @since 1.0.0
   */
  filterCriteria: FilterCriteria[] = [
    {
      value: 'name',
      label: this.translate.instant('customers.name'),
    },
    {
      value: 'city',
      label: this.translate.instant('customers.city'),
    },
    {
      value: 'address',
      label: this.translate.instant('customers.street'),
    },
    {
      value: 'voivodeship',
      label: this.translate.instant('company.voivodeship'),
    },    
  ];
  
  /**
   * Order by field signal
   * @type {WritableSignal<string>}
   * @description Reactive signal for the current sort column
   * @default 'name'
   * @since 1.0.0
   */
  orderBy = signal<string>('name');
  
  /**
   * Sort order signal
   * @type {WritableSignal<string>}
   * @description Reactive signal for the current sort order (ASC/DESC)
   * @default 'ASC'
   * @since 1.0.0
   */
  order = signal<string>('ASC');

  /** Opcje siatki klientów */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 180px)",
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
          caption: this.translate.instant("taxOffices.code"),
          dataField: "code",
          width: 200,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 2, // Wysoki priorytet
        },
        {
          caption: this.translate.instant("taxOffices.name"),
          dataField: "name",
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant("taxOffices.postalCode"),
          dataField: "postalCode",
          width: 200,
          minWidth: 100,
          allowSorting: false,
          hidingPriority: 5,
        },
        {
          caption: this.translate.instant("taxOffices.city"),
          dataField: "city",
          width: 200,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 3,
        },
        {
          caption: this.translate.instant("taxOffices.address"),
          dataField: "address",
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 4,
        },
        {
          caption: this.translate.instant("taxOffices.phone"),
          dataField: "phone",
          width: 200,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant("taxOffices.email"),
          dataField: "email",
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 7,
        },
      ] as GenericGridColumn[]
  );

  /**
   * Creates an instance of OfficeComponent.
   * 
   * @memberof OfficeComponent
   */
  constructor() {}

  /**
   * Initializes the component by loading tax office data and setting up device type subscription.
   * 
   * Sets up the initial data source and subscribes to device type changes for responsive behavior.
   * 
   * @returns {void}
   * @memberof OfficeComponent
   */
  ngOnInit(): void {
    this.getData();
    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  /**
   * Handles input property changes, particularly for dropdown mode.
   * 
   * When controlNameForm changes in dropdown mode, loads the corresponding tax office data
   * and updates the dropdown data source.
   * 
   * @param {SimpleChanges} changes - Object containing the changed properties
   * @returns {void}
   * @memberof OfficeComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["controlNameForm"] && this.dropDownBoxMode()) {
      this.chossingRecord = changes["controlNameForm"].currentValue;
      if (this.chossingRecord !== null) {
        this.appServices
          .getAuth(`tax-offices?taxOfficeId=${this.chossingRecord}`)
          .subscribe((data) => {
            this.dataSourceDropDown = data;
            this.cdr.detectChanges();
          });
      }
    }
  }

  /**
   * Initializes and configures the data source for tax offices.
   * 
   * Creates a DevExtreme DataSource with AspNetData store configuration for server-side data operations.
   * Sets up loading parameters, error handling, and focus management after data load.
   * 
   * @returns {void}
   * @memberof OfficeComponent
   */
  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: "taxOfficeId",
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}tax-offices`,
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        loadParams: this.getLoadParams(),
        onLoaded: (data) => {
          setTimeout(() => {
            this.genericDataGrid.focus();
          }, 0);
        },
      }),
    });
  }

  /**
   * Generates parameters for data loading based on current search and filter state.
   * 
   * Creates an object with search, filter, and sorting parameters that will be sent to the server.
   * 
   * @returns {any} Object containing load parameters for the data source
   * @memberof OfficeComponent
   */
  getLoadParams() {
    let obj: any = {};
    if (this.SearchKey !== "") {
      obj["name"] = this.SearchKey;
    }
    if (this.filterValue) {
      obj[this.orderBy()] = this.filterValue;
    }
    obj["order"] = this.order();
    return obj;
  }

  /**
   * Handles key down events to prevent default behavior for specific keys.
   * 
   * Blocks default behavior for keys that might interfere with grid navigation.
   * 
   * @param {any} event - The key down event object
   * @returns {void}
   * @memberof OfficeComponent
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ["F2", "Escape", "Delete", "Enter"];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Handles double-click events on grid rows.
   * 
   * In dropdown mode, selects the double-clicked tax office.
   * 
   * @param {any} event - The double-click event object containing row data
   * @returns {void}
   * @memberof OfficeComponent
   */
  onRowDblClick(event: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(event.data);
    }
  }

  /**
   * Handles tax office selection in dropdown mode.
   * 
   * Emits the selected tax office to parent components and closes the dropdown.
   * Clears the search key and refreshes data.
   * 
   * @param {any} e - The selected tax office data
   * @returns {void}
   * @memberof OfficeComponent
   */
  onChoosingRecord = (e: any) => {
    if (this.event.sessionData.isActive) {
      this.chossingRecord = e.taxOfficeId;
      this.onChoosed.emit(e);
      this.isGridBoxOpened = false;
      this.SearchKey = "";
      this.getData();
    }
  };

  /**
   * Handles focused row change events in the grid.
   * 
   * Currently logs the event for debugging purposes.
   * 
   * @param {any} event - The focused row change event
   * @returns {void}
   * @memberof OfficeComponent
   */
  onFocusedRowChanged(event: any) {
    console.log(event);
  }

  /**
   * Handles value changes in the dropdown control.
   * 
   * Emits null when the dropdown value is cleared.
   * 
   * @param {any} e - The value change event
   * @returns {void}
   * @memberof OfficeComponent
   */
  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
    }
  };

  /**
   * Handles dropdown opened/closed state changes.
   * 
   * Focuses the grid when dropdown opens and updates the opened state.
   * 
   * @param {any} e - The opened state (true/false)
   * @returns {void}
   * @memberof OfficeComponent
   */
  onOpenedChanged(e: any) {
    if (e) {
      try {
        setTimeout(() => {
          this.gridDropDown.instance.focus();
        }, 500);
      } catch {}
    } else {
      this.isGridBoxOpened = false;
    }
  }

  /**
   * Handles search input with debouncing.
   * 
   * Implements a 500ms delay to avoid excessive server requests while typing.
   * Updates the search key and refreshes data when user stops typing.
   * 
   * @returns {void}
   * @memberof OfficeComponent
   */
  grid_onInput() {
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
   * Handles filter criteria changes.
   * 
   * Updates the filter value and ordering criteria based on user selection,
   * then refreshes the data with new filter parameters.
   * 
   * @param {any} event - The filter change event containing selected item and filter value
   * @returns {void}
   * @memberof OfficeComponent
   */
  onFilterDataChanged(event: any) {
    if (event.selectedItem) {
      this.filterValue = event.filterValue;
      this.orderBy.set(event.selectedItem.value);
      this.getData();
    }
  }

  /**
   * Retrieves data items for mobile view rendering.
   * 
   * Provides data items specifically formatted for mobile display.
   * 
   * @returns {any[]} Array of data items for mobile view
   * @memberof OfficeComponent
   */
  getMobileDataItems(): any[] {
    if (this.dataSource && this.dataSource.items) {
      return this.dataSource.items() || [];
    }
    return [];
  }

  /**
   * Handles item click events in mobile view.
   * 
   * Updates the focused row index and triggers focused row change handling.
   * 
   * @param {any} item - The clicked item data
   * @param {number} index - The index of the clicked item
   * @returns {void}
   * @memberof OfficeComponent
   */
  onMobileItemClick(item: any, index: number) {
    this.focusedRowIndex = index;
    this.onFocusedRowChanged({row: {data: item}});
  }

  /**
   * Cleanup method called when component is destroyed.
   * 
   * Unsubscribes from device type changes to prevent memory leaks.
   * 
   * @returns {void}
   * @memberof OfficeComponent
   */
  ngOnDestroy(): void {
    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();
    }
  }
}
