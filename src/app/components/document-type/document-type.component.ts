import { CommonModule } from "@angular/common";
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
  ChangeDetectorRef,
  Input,
  computed,
} from "@angular/core";
import { DocumentTypeService } from "../../services/document-type.services";
import { DocumentType } from "../../interface/documentType";
import { EventService } from "../../services/event-services.service";
import { DxDataGridModule, DxDropDownBoxModule } from "devextreme-angular";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {
  GenericGridColumn,
  GenericGridOptions,
} from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";

/**
 * Document Type management component for selecting and managing document types.
 * 
 * This component provides functionality for browsing and selecting document types.
 * It supports both standalone grid view and dropdown selection modes.
 * 
 * @example
 * ```html
 * <!-- Standalone document type grid -->
 * <app-document-type></app-document-type>
 * 
 * <!-- Dropdown selector -->
 * <app-document-type [dropDownBoxMode]="true" [controlNameForm]="selectedDocumentTypeName" (onChoosed)="onDocumentTypeSelected($event)"></app-document-type>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
@Component({
  selector: "app-document-type",
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TranslateModule,
    DxDropDownBoxModule,
    GenericDataGridComponent,
  ],
  templateUrl: "./document-type.component.html",
  styleUrl: "./document-type.component.scss",
})
export class DocumentTypeComponent implements OnInit, OnChanges {
  /**
   * Event emitted when a document type is selected
   * @type {EventEmitter<DocumentType>}
   * @description Emits the selected document type data to parent components
   * @example
   * ```html
   * <app-document-type (onChoosed)="handleDocumentTypeSelection($event)"></app-document-type>
   * ```
   * @since 1.0.0
   */
  @Output() onChoosed = new EventEmitter();
  
  /**
   * Event emitted when Poland's ID is determined
   * @type {EventEmitter<string>}
   * @description Emits the ID of Poland document type when found in the dataset
   * @example
   * ```html
   * <app-document-type (setPLId)="setPolandId($event)"></app-document-type>
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
   * <app-document-type [readOnly]="true"></app-document-type>
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
  @ViewChild("gridDropDown") gridDropDown: any;

  /**
   * Dropdown box mode input signal
   * @type {InputSignal<boolean>}
   * @description Determines if the component should display as a dropdown selector
   * @default false
   * @example
   * ```html
   * <app-document-type [dropDownBoxMode]="true"></app-document-type>
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
   * <app-document-type [controlNameForm]="selectedDocumentTypeName"></app-document-type>
   * ```
   * @since 1.0.0
   */
  controlNameForm = input<string>("");

  /**
   * Document type service instance
   * @type {DocumentTypeService}
   * @description Service for managing document type data operations
   * @since 1.0.0
   */
  documentTypeService = inject(DocumentTypeService);
  
  /**
   * Event service instance
   * @type {EventService}
   * @description Service for handling global events and notifications
   * @since 1.0.0
   */
  event = inject(EventService);

  /**
   * Document type list signal
   * @type {WritableSignal<DocumentType[]>}
   * @description Reactive signal containing the list of document types
   * @default []
   * @since 1.0.0
   */
  documentList = signal<DocumentType[]>([]);
  
  /**
   * Data source for the grid
   * @type {DocumentType[]}
   * @description Array of document type data used by the grid component
   * @default []
   * @since 1.0.0
   */
  dataSource: DocumentType[] = [];
  
  /**
   * Grid height configuration
   * @type {number | string}
   * @description Height of the grid, can be a number or CSS string
   * @default 'calc(100vh - 100px)'
   * @since 1.0.0
   */
  heightGrid: number | string = "calc(100vh - 100px)";
  
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
   * Change detector reference
   * @type {ChangeDetectorRef}
   * @description Reference for manually triggering change detection
   * @since 1.0.0
   */
  cdr = inject(ChangeDetectorRef);

  /**
   * Currently selected document type name
   * @type {null | string}
   * @description Name of the currently selected document type, null if none selected
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
   * @description Computed signal containing configuration options for the document type grid
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
   * @description Computed signal containing column definitions for the document type grid
   * @description Includes document type name column
   * @since 1.0.0
   */
  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant("customers.name"),
          dataField: "name",
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 1,
        },
      ] as GenericGridColumn[]
  );

  /**
   * Creates an instance of DocumentTypeComponent.
   * 
   * @memberof DocumentTypeComponent
   */
  constructor() {}

  /**
   * Initializes the component by loading document type data.
   * 
   * Fetches document types from the service and sets up the data source.
   * 
   * @returns {void}
   * @memberof DocumentTypeComponent
   */
  ngOnInit() {
    this.documentTypeService.get().subscribe({
      next: (data: DocumentType[]) => {
        this.documentList.set(data);
        this.dataSource = data;
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  /**
   * Handles input property changes, particularly for dropdown mode.
   * 
   * When controlNameForm changes in dropdown mode, updates the selected document type record
   * and triggers change detection.
   * 
   * @param {SimpleChanges} changes - Object containing the changed properties
   * @returns {void}
   * @memberof DocumentTypeComponent
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes["controlNameForm"] && this.dropDownBoxMode()) {
      this.chossingRecord = changes["controlNameForm"].currentValue;
      this.cdr.detectChanges();
    }
  }

  /**
   * Handles key down events to prevent default behavior for specific keys.
   * 
   * Blocks default behavior for keys that might interfere with grid navigation.
   * 
   * @param {any} event - The key down event object
   * @returns {void}
   * @memberof DocumentTypeComponent
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ["F2", "Escape", "Delete", "Enter"];

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
   * @memberof DocumentTypeComponent
   */
  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
    }
  };

  /**
   * Handles double-click events on grid rows.
   * 
   * In dropdown mode, selects the double-clicked document type.
   * 
   * @param {any} e - The double-click event object containing row data
   * @returns {void}
   * @memberof DocumentTypeComponent
   */
  onRowDblClick(e: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(e.data);
    }
  }

  /**
   * Handles document type selection in dropdown mode.
   * 
   * Emits the selected document type to parent components and closes the dropdown.
   * Only processes selection if session is active.
   * 
   * @param {DocumentType} e - The selected document type data
   * @returns {void}
   * @memberof DocumentTypeComponent
   */
  onChoosingRecord = (e: DocumentType) => {
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
   * @memberof DocumentTypeComponent
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
   * @memberof DocumentTypeComponent
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
   * @memberof DocumentTypeComponent
   */
  onMobileItemClick(item: any, index: number) {
    this.focusedRowIndex = index;
  }
}
