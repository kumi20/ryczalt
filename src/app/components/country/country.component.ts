import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Input,
  computed
} from '@angular/core';
import { CountryService } from '../../services/country-service';
import { Country } from '../../interface/country';
import { EventService } from '../../services/event-services.service';
import { DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GenericGridColumn, GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

/**
 * Country management component for selecting and managing country data.
 * 
 * This component provides functionality for browsing and selecting countries.
 * It supports both standalone grid view and dropdown selection modes.
 * Includes special handling for Poland (Polska) as the default country.
 * 
 * @example
 * ```html
 * <!-- Standalone country grid -->
 * <app-country></app-country>
 * 
 * <!-- Dropdown selector -->
 * <app-country [dropDownBoxMode]="true" [controlNameForm]="selectedCountryName" (onChoosed)="onCountrySelected($event)"></app-country>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
@Component({
  selector: 'app-country',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TranslateModule,
    DxDropDownBoxModule,
    GenericDataGridComponent
  ],
  templateUrl: './country.component.html',
  styleUrl: './country.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryComponent implements OnInit, OnChanges {
  /**
   * Event emitted when a country is selected
   * @type {EventEmitter<Country>}
   * @description Emits the selected country data to parent components
   * @example
   * ```html
   * <app-country (onChoosed)="handleCountrySelection($event)"></app-country>
   * ```
   * @since 1.0.0
   */
  @Output() onChoosed = new EventEmitter();
  
  /**
   * Event emitted when Poland's ID is determined
   * @type {EventEmitter<string>}
   * @description Emits the ID of Poland country when found in the dataset
   * @example
   * ```html
   * <app-country (setPLId)="setPolandId($event)"></app-country>
   * ```
   * @since 1.0.0
   */
  @Output() setPLId = new EventEmitter();
  
  /**
   * Read-only mode flag
   * @type {boolean}
   * @description Determines if the component is in read-only mode
   * @default false
   * @example
   * ```html
   * <app-country [readOnly]="true"></app-country>
   * ```
   * @since 1.0.0
   */
  @Input() readOnly: boolean = false;
  
  /**
   * Reference to the dropdown grid component
   * @type {any}
   * @description ViewChild reference to the dropdown grid for programmatic access
   * @since 1.0.0
   */
  @ViewChild('gridDropDown') gridDropDown: any;

  /**
   * Dropdown box mode input signal
   * @type {InputSignal<boolean>}
   * @description Determines if the component should display as a dropdown selector
   * @default false
   * @example
   * ```html
   * <app-country [dropDownBoxMode]="true"></app-country>
   * ```
   * @since 1.0.0
   */
  dropDownBoxMode = input<boolean>(false);
  
  /**
   * CSS class name input signal
   * @type {InputSignal<boolean>}
   * @description Controls CSS class application for styling
   * @default false
   * @since 1.0.0
   */
  className = input<boolean>(false);
  
  /**
   * Form control name input signal
   * @type {InputSignal<string>}
   * @description The name of the form control for dropdown mode
   * @default ''
   * @example
   * ```html
   * <app-country [controlNameForm]="selectedCountryName"></app-country>
   * ```
   * @since 1.0.0
   */
  controlNameForm = input<string>('');

  /**
   * Country service instance
   * @type {CountryService}
   * @description Service for managing country data operations
   * @since 1.0.0
   */
  countryServices = inject(CountryService);
  
  /**
   * Event service instance
   * @type {EventService}
   * @description Service for handling global events and notifications
   * @since 1.0.0
   */
  event = inject(EventService);

  /**
   * Country list signal
   * @type {WritableSignal<Country[]>}
   * @description Reactive signal containing the list of countries
   * @default []
   * @since 1.0.0
   */
  countryList = signal<Country[]>([]);
  
  /**
   * Data source for the grid
   * @type {Country[]}
   * @description Array of country data used by the grid component
   * @default []
   * @since 1.0.0
   */
  dataSource: Country[] = [];
  
  /**
   * Grid height configuration
   * @type {number | string}
   * @description Height of the grid, can be a number or CSS string
   * @default 'calc(100vh - 100px)'
   * @since 1.0.0
   */
  heightGrid: number | string = 'calc(100vh - 100px)';
  
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
   * @default 300
   * @since 1.0.0
   */
  pageSize: number = 300;
  
  /**
   * Grid dropdown open state
   * @type {boolean}
   * @description Indicates if the dropdown grid is currently open
   * @default false
   * @since 1.0.0
   */
  isGridBoxOpened: boolean = false;

  /**
   * Currently selected country name
   * @type {null | string}
   * @description Name of the currently selected country, null if none selected
   * @default null
   * @since 1.0.0
   */
  chossingRecord: null | string = null;

  /**
   * Translation service instance
   * @type {TranslateService}
   * @description Service for handling internationalization and translations
   * @since 1.0.0
   */
  translate = inject(TranslateService);

  /**
   * Grid options configuration
   * @type {Signal<GenericGridOptions>}
   * @description Computed signal containing configuration options for the country grid
   * @description Includes height, column hiding, and column chooser settings
   * @since 1.0.0
   */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 100px)",
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
   * @description Computed signal containing column definitions for the country grid
   * @description Includes system status, country code, and country name columns
   * @since 1.0.0
   */
  columns = computed(
    () =>
      [ 
        {
          caption: this.translate.instant("country.isSystem"),
          dataField: "isSystem",
          width: 100,
          allowSorting: false,
          alignment: "center",
          hidingPriority: 3,
          dataType: 'string',
          encodeHtml: false,
          cellTemplate: (e: any) => {
            return e.value ? '<img src="../../../assets/images/check-solid.svg" alt="" width="14" />' : '';
          }
        },
        {
          caption: this.translate.instant("country.code"),
          dataField: "code",
          width: 100,
          minWidth: 80,
          allowSorting: false,
          hidingPriority: 2,
        },
        {
          caption: this.translate.instant("country.name"),
          dataField: "name",
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 1,
        }
      ] as GenericGridColumn[]
  );

  /**
   * Creates an instance of CountryComponent.
   * 
   * @memberof CountryComponent
   */
  constructor() {}

  /**
   * Initializes the component by loading country data.
   * 
   * Fetches countries from the service, sets up the data source, and handles special logic for Poland.
   * Also positions the focus on the previously selected country if applicable.
   * 
   * @returns {void}
   * @memberof CountryComponent
   */
  ngOnInit() {
    this.countryServices.getCountries().subscribe({
      next: (data: Country[]) => {
        this.countryList.set(data);
        this.dataSource = data;

        const inPl = data.find((x) => x.name === 'Polska');
        if (inPl) {
          this.setPLId.emit(inPl.id);
        }
        if(this.chossingRecord != null) {
          const index = data.findIndex((x) => x.name === this.chossingRecord);
          if (index >= 0) {
            this.focusedRowIndex = index;
          }
        }
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  /**
   * Handles input property changes, particularly for dropdown mode.
   * 
   * When controlNameForm changes in dropdown mode, updates the selected country record.
   * 
   * @param {SimpleChanges} changes - Object containing the changed properties
   * @returns {void}
   * @memberof CountryComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['controlNameForm'] && this.dropDownBoxMode()) {
      this.chossingRecord = changes['controlNameForm'].currentValue;
    }
  }

  /**
   * Handles key down events to prevent default behavior for specific keys.
   * 
   * Blocks default behavior for keys that might interfere with grid navigation.
   * 
   * @param {any} event - The key down event object
   * @returns {void}
   * @memberof CountryComponent
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Handles value changes in the dropdown control.
   * 
   * Emits null when the dropdown value is cleared.
   * 
   * @param {any} e - The value change event
   * @returns {void}
   * @memberof CountryComponent
   */
  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
    }
  };

  /**
   * Handles double-click events on grid rows.
   * 
   * In dropdown mode, selects the double-clicked country.
   * 
   * @param {any} e - The double-click event object containing row data
   * @returns {void}
   * @memberof CountryComponent
   */
  onRowDblClick(e: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(e.data);
    }
  }

  /**
   * Handles country selection in dropdown mode.
   * 
   * Emits the selected country to parent components and closes the dropdown.
   * Only processes selection if session is active.
   * 
   * @param {Country} e - The selected country data
   * @returns {void}
   * @memberof CountryComponent
   */
  onChoosingRecord = (e: Country) => {
    if (this.event.sessionData.isActive) {

      this.chossingRecord = e.name;
      this.onChoosed.emit(e);
      this.isGridBoxOpened = false;
    }
  };

  /**
   * Handles dropdown opened/closed state changes.
   * 
   * Focuses the grid when dropdown opens and updates the opened state.
   * 
   * @param {any} e - The opened state (true/false)
   * @returns {void}
   * @memberof CountryComponent
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
   * Handles focused row change events in the grid.
   * 
   * Placeholder for handling focused row changes.
   * 
   * @param {any} event - The focused row change event
   * @returns {void}
   * @memberof CountryComponent
   */
  onFocusedRowChanged(event: any) {
    // Handle focused row change
  }

  /**
   * Handles item click events in mobile view.
   * 
   * Updates the focused row index for mobile navigation.
   * 
   * @param {any} item - The clicked item data
   * @param {number} index - The index of the clicked item
   * @returns {void}
   * @memberof CountryComponent
   */
  onMobileItemClick(item: any, index: number) {
    this.focusedRowIndex = index;
  }
}
