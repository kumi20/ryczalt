import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  AfterContentInit,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  signal,
  inject,
  ChangeDetectorRef,
  input,
  effect,
  Signal,
  computed,
  OnDestroy,
  model,
} from "@angular/core";
import {
  DxDataGridComponent,
  DxDataGridModule,
  DxButtonModule,
  DxContextMenuModule,
} from "devextreme-angular";
import { CommonModule } from "@angular/common";
import {
  GenericGridColumn,
  GenericGridTemplate,
  GenericGridOptions,
} from "./generic-data-grid.model";
import { EventService } from "../../../services/event-services.service";
import { MobileListComponent } from "../mobile-list/mobile-list.component";
import { ColumnChooserComponent } from "../column-chooser/column-chooser.component";
import {
  InitializedEvent,
  CellPreparedEvent,
  FocusedRowChangedEvent,
  KeyDownEvent,
  RowExpandingEvent,
  RowExpandedEvent,
  SelectionChangedEvent,
  RowClickEvent,
  ContentReadyEvent,
  RowDragging,
  Editing,
  Scrolling,
  Grouping,
  Pager,
  Paging,
  ColumnFixing,
  Selection,
} from "devextreme/ui/data_grid";

import { DxDataGridTypes } from "devextreme-angular/ui/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
// Our demo infrastructure requires us to use 'file-saver-es'. We recommend that you use the official 'file-saver' package in your applications.
import { exportDataGrid } from "devextreme/excel_exporter";

interface SortingIcons {
  asc: Element[];
  desc: Element[];
}

/**
 * A generic data grid component that provides a flexible interface for displaying tabular data.
 *
 * ## Features
 * - Supports dynamic columns and templates
 * - Custom headers with sorting capabilities
 * - Column resizing, reordering, and visibility control
 * - State persistence with localStorage
 * - Custom tooltips for column headers via the headerTooltip property
 * - Mobile-responsive with context menu support
 * - Advanced selection modes
 * - Keyboard navigation
 *
 * @example
 * ```html
 * <app-generic-data-grid
 *   [dataSource]="yourDataSource"
 *   [columns]="[
 *     { dataField: 'id', caption: 'ID', headerTooltip: 'Unique identifier' },
 *     { dataField: 'name', caption: 'Name', headerTooltip: 'Full name of the person' }
 *   ]"
 *   [options]="{ showBorders: true }"
 *   (onRowDblClick)="handleRowDblClick($event)"
 * ></app-generic-data-grid>
 * ```
 */
@Component({
  selector: "app-generic-data-grid",
  templateUrl: "./generic-data-grid.component.html",
  styleUrls: ["./generic-data-grid.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    MobileListComponent,
    DxButtonModule,
    ColumnChooserComponent,
    DxContextMenuModule,
  ],
})
export class GenericDataGridComponent
  implements AfterContentInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild("dataGrid") dataGrid!: any;

  // Dane wejściowe
  dataSource = input<any>();
  columns = input<GenericGridColumn[]>([]);
  options = input<GenericGridOptions>({ remoteOperations: true });
  selectedRowKeys = model<any[]>([]);
  focusedRowIndex = input<number>(0);
  focusedRowKey = input<any>(undefined);
  autoFocus = input<boolean>(true);
  storageKey = input<string | null>(null);
  dataCy = input<string | null>(null);
  templateRefs = input<{ [key: string]: TemplateRef<any> }>({});
  setFocusOnData = input<boolean>(false);
  hoverStateEnabled = input<boolean>(true);
  contextMenu = input<any[]>([]);
  classCss = input<string | null>(null);
  orderBy = input<string | null>(null);
  order = input<"ASC" | "DESC" | null | string>(null);
  columnsChooserVisible = input<boolean>(false);

  /**
   * @description Computed signals for nested options
   */
  public readonly columnFixing: Signal<ColumnFixing | undefined> = computed(
    () => this.options()?.columnFixing
  );
  public readonly editing: Signal<Editing | undefined> = computed(
    () => this.options()?.editing
  );
  public readonly grouping: Signal<Grouping | undefined> = computed(
    () => this.options()?.grouping
  );
  public readonly pager: Signal<Pager | undefined> = computed(
    () => this.options()?.pager
  );
  public readonly paging: Signal<Paging | undefined> = computed(
    () => this.options()?.paging
  );
  public readonly rowDragging: Signal<RowDragging | undefined> = computed(
    () => this.options()?.rowDragging
  );
  public readonly scrolling: Signal<Scrolling | undefined> = computed(
    () => this.options()?.scrolling
  );
  public readonly selection: Signal<Selection | undefined> = computed(
    () => this.options()?.selection
  );

  // Zdarzenia wyjściowe
  @Output() onFocusedRowChanged = new EventEmitter<FocusedRowChangedEvent>();
  @Output() onRowDblClick = new EventEmitter<any>();
  @Output() onCellPrepared = new EventEmitter<CellPreparedEvent>();
  @Output() onKeyDown = new EventEmitter<KeyDownEvent>();
  @Output() onRowExpanded = new EventEmitter<RowExpandedEvent>();
  @Output() onRowExpanding = new EventEmitter<RowExpandingEvent>();
  @Output() selectedRowKeysChange = new EventEmitter<any[]>();
  @Output() focusedRowIndexChange = new EventEmitter<number>();
  @Output() onColumnReordered = new EventEmitter<any>();
  @Output() onColumnResized = new EventEmitter<any>();
  @Output() onSelectionChanged = new EventEmitter<SelectionChangedEvent>();
  @Output() onLoaded = new EventEmitter<any>();
  @Output() onContextMenuClick = new EventEmitter<any>();
  @Output() onRowClick = new EventEmitter<RowClickEvent>();
  @Output() onContentReady = new EventEmitter<ContentReadyEvent>();
  @Output() onInitialized = new EventEmitter<InitializedEvent>();
  @Output() onOrderClick = new EventEmitter<any>();
  @Output() onColumnHeaderClick = new EventEmitter<any>();
  @Output() onColumnsChooserVisibleChange = new EventEmitter<boolean>();
  @Output() onOptionChanged = new EventEmitter<any>();
  @Output() onFocusedCellChanged = new EventEmitter<any>();
  @Output() onTab = new EventEmitter<any>();

  // Wewnętrzne
  templates: GenericGridTemplate[] = [];
  event = inject(EventService);
  dynamicTemplates: { [key: string]: (cellData: any) => string } = {};

  sortingIcons: SortingIcons = {
    asc: [],
    desc: [],
  };

  isHold: boolean = false;
  timerSel: any;

  isQuickPress: boolean = true;
  toDeselect: any[] = [];
  toSelect: any[] = [];
  isContextMenuMobile = signal(false);
  unicalGuid: number = new Date().getTime() + Math.round(Math.random() * 10000);
  deviceTypeSubscription: any;

  constructor(private cdr: ChangeDetectorRef) {
    // Set up effect to handle focus changes
    effect(() => {
      const shouldFocus = this.setFocusOnData();
      if (shouldFocus && this.dataGrid?.instance) {
        setTimeout(() => {
          this.focus();
        }, 100);
      }
    });

    // Subscribe to device type changes
    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
      setTimeout(() => {
        if (this.dataGrid?.instance) {
          this.dataGrid.instance.updateDimensions();
        }
      }, 100);
    });
  }

  /**
   * Helper method to safely access nested column properties
   * This resolves type issues with string | Column<any, any>
   */
  getNestedColumnProp(
    column: any,
    prop: string,
    defaultValue: any = null
  ): any {
    if (!column || typeof column === "string") {
      return defaultValue;
    }
    return column[prop] !== undefined ? column[prop] : defaultValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["templateRefs"] && this.templateRefs()) {
      this.updateTemplates();
    }

    if (changes["orderBy"] && this.orderBy()) {
      this.highlightSortedColumn(this.orderBy() as string);
    }
  }

  /**
   * @description Saves column settings to storage and sends them to the server
   */
  ngOnDestroy(): void {
    if (this.storageKey()) {
      this.saveColumnSettingsToStorage(this.storageKey() as string);
    }
    
    // Clean up device type subscription
    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();
    }
  }

  ngAfterContentInit(): void {
    this.updateTemplates();
  }

  ngAfterViewInit(): void {
    // Ensure templates are initialized
    if (this.templateRefs() && Object.keys(this.templateRefs()).length > 0) {
      this.updateTemplates();
    }

    const shouldAutoFocus =
      this.autoFocus() !== false && this.options().autoFocus !== false;
    if (shouldAutoFocus) {
      setTimeout(() => {
        this.focus();
      }, 100);
    }
    if (this.storageKey()) {
      this.loadColumnSettingsFromStorage(this.storageKey() as string);
    }
    this.cdr.detectChanges();
  }

  /**
   * @openapi
   * @description Updates the internal templates list based on the provided template references.
   * This method is called when the templateRefs input changes and during component initialization.
   * It processes both static templateRefs and dynamic cellTemplates.
   */
  updateTemplates(): void {
    this.templates = [];
    this.dynamicTemplates = {};

    // Process static templates
    if (this.templateRefs()) {
      Object.entries(this.templateRefs())
        .filter(([_, template]) => template)
        .forEach(([key, template]) => {
          this.templates.push({
            name: key,
            template: template,
          });
        });
    }

    // Process dynamic templates from columns
    this.columns().forEach((column, index) => {
      // Process main level column
      if (column.cellTemplate) {
        const templateName = `dynamic_${
          column.name || column.dataField || index
        }`;
        this.dynamicTemplates[templateName] = column.cellTemplate;
        this.templates.push({
          name: templateName,
          template: null, // We'll handle dynamic templates differently
        });
      }

      // Process nested columns recursively
      if (
        column.columns &&
        Array.isArray(column.columns) &&
        column.columns.length > 0
      ) {
        this.processNestedColumnTemplates(
          column.columns as GenericGridColumn[]
        );
      }
    });

    this.cdr.detectChanges();
  }

  /**
   * @description Recursively processes templates for nested columns
   * @param nestedColumns - Array of nested GenericGridColumn objects
   * @param parentPrefix - Optional prefix for template names (used in recursion)
   */
  private processNestedColumnTemplates(
    nestedColumns: GenericGridColumn[],
    parentPrefix: string = ""
  ): void {
    nestedColumns.forEach((nestedColumn: GenericGridColumn, index) => {
      // Process cellTemplate for the nested column
      if (nestedColumn.cellTemplate) {
        const prefix = parentPrefix ? `${parentPrefix}_` : "";
        const templateName = `dynamic_${prefix}${
          nestedColumn.name || nestedColumn.dataField || index
        }`;
        this.dynamicTemplates[templateName] = nestedColumn.cellTemplate;
        this.templates.push({
          name: templateName,
          template: null,
        });
      }

      // Continue recursion if this nested column has its own nested columns
      if (
        nestedColumn.columns &&
        Array.isArray(nestedColumn.columns) &&
        nestedColumn.columns.length > 0
      ) {
        const newPrefix = parentPrefix
          ? `${parentPrefix}_${
              nestedColumn.name || nestedColumn.dataField || index
            }`
          : `${nestedColumn.name || nestedColumn.dataField || index}`;
        this.processNestedColumnTemplates(
          nestedColumn.columns as GenericGridColumn[],
          newPrefix
        );
      }
    });
  }

  /**
   * @openapi
   * @description Renders a dynamic cell template.
   * This method is used to render cell templates that are defined as functions.
   *
   * @param templateName - The name of the template to render
   * @param cellData - The data for the cell
   * @returns The rendered HTML string
   */
  renderDynamicTemplate(templateName: string, cellData: any): string {
    const template = this.dynamicTemplates[templateName];
    if (template) {
      return template(cellData);
    }
    return "";
  }

  /**
   * @openapi
   * @description Provides a tracking function for Angular's ngFor directive when rendering columns.
   * Using this function improves performance by helping Angular identify which items have changed.
   *
   * @param index - The index of the current column in the array
   * @param column - The current column object
   * @returns A unique string identifier for the column
   */
  trackByColumnName(index: number, column: GenericGridColumn): string {
    return column.name || column.dataField || index.toString();
  }

  /**
   * @openapi
   * @description Returns the internal DevExtreme DataGrid instance.
   * This allows parent components to access the underlying grid functionality directly.
   *
   * @returns The DxDataGridComponent instance
   */
  getInstance(): DxDataGridComponent {
    return this.dataGrid;
  }

  /**
   * @openapi
   * @description Refreshes the grid data display.
   * This triggers the DevExtreme grid to update its view with the current data.
   * Useful after data modifications or when grid configuration changes.
   */
  refresh(): void {
    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.refresh();
    }
  }

  /**
   * @openapi
   * @description Refreshes the grid data and sets focus on the grid.
   * This is a convenience method that combines refresh() and focus() operations
   * with a short delay to ensure the grid has completed its refresh before setting focus.
   */
  refreshAndFocus(): void {
    this.refresh();

    // Ustawienie timeouta, aby upewnić się, że dane zostały załadowane
    setTimeout(() => {
      this.focus();
    }, 100);
  }

  /**
   * @openapi
   * @description Retrieves the data object of the currently focused row.
   * This method handles different row types (standard data rows and group rows)
   * and provides appropriate data depending on the row type.
   *
   * For group rows, it returns an object with group information.
   * For data rows, it returns the raw data object.
   * If no row is focused, it attempts to find data using the focusedRowKey.
   *
   * @returns The data object of the focused row, or null if no row is focused
   */
  getFocusedRowData(): any {
    if (this.dataGrid && this.dataGrid.instance) {
      // Pobranie indeksu aktualnie zaznaczonego wiersza
      const rowIndex = this.dataGrid.instance.option("focusedRowIndex");

      if (rowIndex !== undefined && rowIndex >= 0) {
        // Pobranie wiersza z kolekcji widocznych wierszy
        const visibleRow = this.dataGrid.instance.getVisibleRows()[rowIndex];

        // Sprawdzenie typu wiersza (normalny, grupujący, podsumowujący, itp.)
        if (visibleRow) {
          // Dla wierszy grupujących zwracamy obiekt z informacją o grupie
          if (visibleRow.rowType === "group") {
            return {
              isGroupRow: true,
              key: visibleRow.key,
              data: visibleRow.data,
              groupData: visibleRow.data?.items,
              groupIndex: visibleRow.groupIndex,
            };
          }

          // Dla zwykłych wierszy danych zwracamy obiekt danych
          if (visibleRow.rowType === "data") {
            return visibleRow.data;
          }
        }
      }

      // Próba pobrania danych za pomocą klucza, jako alternatywna metoda
      const focusedRowKey = this.dataGrid.instance.option("focusedRowKey");
      if (focusedRowKey !== undefined) {
        const dataSource = this.dataGrid.instance.getDataSource();
        if (dataSource) {
          const keyExpr = dataSource.key();
          if (keyExpr && typeof keyExpr === "string") {
            // Szukanie elementu o podanym kluczu w źródle danych
            const items = dataSource.items() || [];
            return items.find((item: any) => item[keyExpr] === focusedRowKey);
          }
        }
      }
    }
    return null;
  }

  /**
   * @openapi
   * @description Sets focus on the grid.
   * This method activates keyboard navigation on the grid.
   */
  focus(): void {
    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.focus();
    }
  }

  /**
   * @openapi
   * @description Highlights the column by which data is sorted.
   * Applies a CSS class to the sorted column and another class to all other columns.
   *
   * @param orderBy - Field name by which data is sorted
   * @param highlightClass - CSS class for highlighting the sorted column (default: 'sort-column-bg')
   * @param defaultClass - CSS class for other columns (default: 'sort-column-muted')
   */
  highlightSortedColumn(
    orderBy: string,
    highlightClass: string = "sort-column-bg",
    defaultClass: string = "sort-column-muted"
  ): void {
    if (!this.columns() || !orderBy) return;

    this.columns().forEach((column) => {
      if (column.dataField === orderBy.replace("Intuition", "")) {
        column.cssClass = highlightClass;
      } else {
        column.cssClass = defaultClass;
      }
    });
  }

  /**
   * @openapi
   * @description Handles grid option change events.
   * This method processes different types of option changes:
   * - Column visibility changes
   * - Column width changes
   * - Column order changes
   *
   * For each change type, it:
   * 1. Logs the change for debugging
   * 2. Emits appropriate events for parent components
   * 3. Saves settings to storage if a storageKey is provided
   *
   * @param e - The option change event object
   */
  handleOptionChanged(e: any): void {
    // Sprawdź czy zdarzenie dotyczy kolumn
    if (e && e.fullName) {
      const fullName = e.fullName.toLowerCase();

      if (fullName.includes("columns") && fullName.includes("width")) {
        // Emituj zdarzenie do komponentu nadrzędnego
        this.onColumnResized.emit(e);
      }

      // Obsługa zmiany kolejności kolumn
      else if (
        fullName.includes("columns") &&
        fullName.includes("visibleindex")
      ) {
        // Emituj zdarzenie do komponentu nadrzędnego
        this.onColumnReordered.emit(e);
      }
    }
  }

  /**
   * @openapi
   * @description Saves the current column configuration including order, width, and visibility.
   * This method collects information about all columns in the grid, both visible and hidden.
   *
   * The returned object contains:
   * - Column indices that determine their display order
   * - Column widths (when explicitly set)
   * - Column visibility status
   *
   * @returns An object mapping column IDs to their configuration settings
   */
  saveColumnSettings(): {
    [key: string]: {
      index: number;
      width?: number;
      visible: boolean;
      fixed?: boolean | string;
    };
  } {
    if (!this.dataGrid || !this.dataGrid.instance) {
      return {};
    }

    const columnSettings: {
      [key: string]: {
        index: number;
        width?: number;
        visible: boolean;
        fixed?: boolean | string;
      };
    } = {};
    const visibleColumns = this.dataGrid.instance.getVisibleColumns();

    // Get all column IDs from the original column definitions and all current columns in the grid
    const allColumnIds = [
      ...new Set([
        ...this.columns().map((column) => column.name || column.dataField),
        ...visibleColumns.map((column: any) => column.name || column.dataField),
      ]),
    ].filter((id) => id); // Filter out undefined/null/empty

    // First process visible columns
    visibleColumns.forEach((column: any, index: number) => {
      // Używamy name jeśli jest dostępne, w przeciwnym razie dataField
      const columnId = column.name || column.dataField;
      if (columnId) {
        columnSettings[columnId] = {
          index: index,
          width: typeof column.width === "number" ? column.width : undefined,
          visible: true,
          fixed: column.fixed !== undefined ? column.fixed : undefined,
        };
      }
    });

    // Then add hidden columns (those that are in allColumnIds but not in visibleColumns)
    allColumnIds.forEach((columnId) => {
      if (columnId && !columnSettings[columnId]) {
        // Find the original column to get its properties
        const originalColumn = this.columns().find(
          (c) => (c.name || c.dataField) === columnId
        );

        // Sprawdź aktualny stan kolumny w instancji grida
        let visible = false;
        let width = undefined;
        let fixed = undefined;

        try {
          // Spróbuj pobrać ustawienia z instancji grida
          const columnOption = this.dataGrid.instance.columnOption(columnId);
          if (columnOption) {
            visible = columnOption.visible === true;
            width =
              typeof columnOption.width === "number"
                ? columnOption.width
                : undefined;
            fixed =
              columnOption.fixed !== undefined ? columnOption.fixed : undefined;
          }
        } catch (error) {
          // Jeśli nie udało się pobrać ustawień, użyj oryginalnych wartości
          visible = originalColumn?.visible !== false;
          width = originalColumn?.width;
          fixed =
            originalColumn?.fixed !== undefined
              ? originalColumn?.fixed
              : undefined;
        }

        columnSettings[columnId] = {
          index: Number.MAX_VALUE, // Hidden columns get placed at the end
          width: typeof width === "number" ? width : undefined,
          visible: visible,
          fixed: fixed,
        };
      }
    });

    return columnSettings;
  }

  /**
   * @openapi
   * @description Applies previously saved column configuration to the grid.
   * This method updates the grid's column properties based on the provided settings:
   * 1. First applies width, visibility, and fixed settings to all columns
   * 2. Then applies column order for visible columns
   * 3. Finally refreshes the grid to show the updated configuration
   *
   * @param columnSettings - Object mapping column IDs to their configuration settings
   */
  applyColumnSettings(columnSettings: {
    [key: string]: {
      index: number;
      width?: number;
      visible: boolean;
      fixed?: boolean | string;
    };
  }): void {
    if (!this.dataGrid || !this.dataGrid.instance || !columnSettings) {
      return;
    }

    const gridInstance = this.dataGrid.instance;
    gridInstance.beginUpdate();

    // Najpierw zastosuj szerokość i widoczność kolumn
    Object.keys(columnSettings).forEach((columnId) => {
      const settings = columnSettings[columnId];

      // Ustaw szerokość kolumny jeśli jest zdefiniowana
      if (settings.width) {
        gridInstance.columnOption(columnId, "width", settings.width);
      }

      // Ustaw widoczność kolumny
      gridInstance.columnOption(columnId, "visible", settings.visible);

      // Ustaw fixed jeśli jest zdefiniowane
      if (settings.fixed !== undefined) {
        gridInstance.columnOption(columnId, "fixed", settings.fixed);
      }
    });

    // Teraz zastosuj kolejność kolumn
    const visibleColumns = Object.entries(columnSettings)
      .filter(([_, settings]) => settings.visible)
      .sort((a, b) => a[1].index - b[1].index);

    visibleColumns.forEach(([columnId], index) => {
      gridInstance.columnOption(columnId, "visibleIndex", index);
    });

    gridInstance.endUpdate();

    // Odśwież grid
    setTimeout(() => {
      this.refresh();
    }, 0);
  }

  /**
   * @openapi
   * @description Handles column configuration changes from the column chooser component.
   * When columns are changed (visibility, order, etc.), this method saves the new
   * configuration to local storage if a storageKey is provided.
   */
  onColumnsChanged(): void {
    this.onColumnsChooserVisibleChange.emit(false);
  }

  /**
   * @openapi
   * @description Saves current column configuration to local storage.
   * This method:
   * 1. Collects column settings using saveColumnSettings()
   * 2. Serializes the settings to JSON
   * 3. Stores them in localStorage with a key based on the provided storageKey
   *
   * @param storageKey - Key used to save configuration in local storage
   * @returns The column settings object that was saved
   */
  saveColumnSettingsToStorage(storageKey: string): {
    [key: string]: {
      index: number;
      width?: number;
      visible: boolean;
      fixed?: boolean | string;
    };
  } {
    if (!storageKey) {
      console.warn("Nie podano klucza do zapisania konfiguracji kolumn");
      return {};
    }
    const columnSettings = this.saveColumnSettings();

    try {
      localStorage.setItem(
        `${storageKey}_columns`,
        JSON.stringify(columnSettings)
      );
    } catch (error) {
      console.error(
        "Błąd podczas zapisywania konfiguracji kolumn do local storage",
        error
      );
    }

    return columnSettings;
  }

  /**
   * @openapi
   * @description Loads and applies column configuration from local storage.
   * This method performs the following actions:
   * 1. Retrieves saved column settings from localStorage using the provided key
   * 2. Handles both new format (with width and visibility) and legacy format (order only)
   * 3. Applies the settings to the grid using applyColumnSettings
   * 4. For legacy format, converts it to the new format and updates storage
   *
   * @param storageKey - Key used to retrieve configuration from local storage
   * @returns The loaded column settings object, or null if no settings are found
   */
  loadColumnSettingsFromStorage(storageKey: string): {
    [key: string]: {
      index: number;
      width?: number;
      visible: boolean;
      fixed?: boolean | string;
    };
  } | null {
    if (!storageKey) {
      console.warn("Nie podano klucza do odczytania konfiguracji kolumn");
      return null;
    }

    try {
      const savedConfig = localStorage.getItem(`${storageKey}_columns`);
      if (savedConfig) {
        const columnSettings = JSON.parse(savedConfig);
        this.applyColumnSettings(columnSettings);
        return columnSettings;
      }

      const savedLegacyConfig = localStorage.getItem(storageKey);
      if (savedLegacyConfig) {
        const legacyColumnOrder = JSON.parse(savedLegacyConfig);
        const columnSettings: {
          [key: string]: {
            index: number;
            width?: number;
            visible: boolean;
            fixed?: boolean | string;
          };
        } = {};
        Object.keys(legacyColumnOrder).forEach((key) => {
          columnSettings[key] = {
            index: legacyColumnOrder[key],
            visible: true,
          };
        });

        this.applyColumnSettings(columnSettings);
        localStorage.removeItem(storageKey);
        return columnSettings;
      }
    } catch (error) {
      console.error(
        "Błąd podczas odczytywania konfiguracji kolumn z local storage",
        error
      );
    }

    return null;
  }

  /**
   * @openapi
   * @description Handles the column reset action triggered by the column chooser component.
   * This method resets all columns to their default configuration, removing any customizations
   * like visibility, width, or order changes that users might have applied.
   *
   * If a storageKey is provided, it will use the restoreDefaultColumnSettings method to:
   * 1. Clear any saved column settings from local storage
   * 2. Reset column visibility to default values
   * 3. Reset column widths to their original values
   * 4. Restore the original fixed state
   * 5. Restore the original column order as defined in the columns array
   * 6. Refreshes the grid to display the default configuration
   *
   * After resetting, the grid will be refreshed to display the default configuration.
   *
   * @example
   * // Inside the column-chooser component:
   * <app-column-chooser
   *   [gridRef]="dataGrid"
   *   (onColumnReset)="onColumnReset()">
   * </app-column-chooser>
   */
  onColumnReset(): void {
    if (this.storageKey()) {
      this.restoreDefaultColumnSettings(this.storageKey() as string);
    }
  }

  /**
   * @openapi
   * @description Restores columns to their default configuration as defined in the initial column array.
   * This method performs the following actions:
   * 1. If a storageKey is provided, removes any saved column settings from local storage
   * 2. Sets column visibility to match the original definition (visible by default unless explicitly set to false)
   * 3. Resets column widths to their original values or removes custom widths
   * 4. Restores the original fixed state
   * 5. Restores the original column order as defined in the columns array
   * 6. Refreshes the grid to display the default configuration
   *
   * This method is called by onColumnReset and can also be called directly when needed.
   *
   * @param storageKey - Optional key to remove saved configuration from local storage
   * @example
   * // Reset columns to default state and clear saved settings
   * this.dataGrid.restoreDefaultColumnSettings('myGridSettings');
   *
   * // Reset columns without affecting local storage
   * this.dataGrid.restoreDefaultColumnSettings();
   */
  restoreDefaultColumnSettings(storageKey?: string): void {
    if (storageKey) {
      try {
        localStorage.removeItem(`${storageKey}_columns`);
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error(
          "Błąd podczas usuwania konfiguracji kolumn z local storage",
          error
        );
      }
    }

    if (!this.dataGrid || !this.dataGrid.instance) {
      return;
    }

    const originalColumns = [...this.columns()];

    this.dataGrid.instance.beginUpdate();

    originalColumns.forEach((column, index) => {
      const dataField = column.dataField;
      const name = column.name;
      const columnId = name || dataField;

      if (columnId) {
        this.dataGrid.instance.columnOption(
          columnId,
          "visible",
          column.visible !== false
        );

        if (column.width) {
          this.dataGrid.instance.columnOption(columnId, "width", column.width);
        } else {
          this.dataGrid.instance.columnOption(columnId, "width", undefined);
        }

        // Przywróć domyślną wartość fixed
        this.dataGrid.instance.columnOption(columnId, "fixed", column.fixed);

        this.dataGrid.instance.columnOption(columnId, "visibleIndex", index);
      }
    });

    this.dataGrid.instance.endUpdate();
    this.refresh();
  }

  // Zachowanie kompatybilności wstecznej - aliasy dla starych metod
  /**
   * @openapi
   * @description Legacy method that extracts only the order of visible columns.
   * This method is maintained for backward compatibility with older code.
   * It converts the new column settings format to the old format that only
   * included column order information.
   *
   * @returns An object mapping column IDs to their order indices
   */
  saveColumnOrder(): { [key: string]: number } {
    const columnSettings = this.saveColumnSettings();
    const columnOrder: { [key: string]: number } = {};

    Object.keys(columnSettings).forEach((key) => {
      if (columnSettings[key].visible) {
        columnOrder[key] = columnSettings[key].index;
      }
    });

    return columnOrder;
  }

  /**
   * @openapi
   * @description Legacy method that applies column order from the old format.
   * This method is maintained for backward compatibility with older code.
   * It converts the old column order format to the new settings format and
   * applies it to the grid.
   *
   * @param columnOrder - Object mapping column IDs to their order indices
   */
  applyColumnOrder(columnOrder: { [key: string]: number }): void {
    const columnSettings: {
      [key: string]: {
        index: number;
        width?: number;
        visible: boolean;
        fixed?: boolean | string;
      };
    } = {};

    Object.keys(columnOrder).forEach((key) => {
      columnSettings[key] = {
        index: columnOrder[key],
        visible: true,
      };
    });

    this.applyColumnSettings(columnSettings);
  }

  /**
   * @openapi
   * @description Legacy method that saves column order to local storage.
   * This method is maintained for backward compatibility with older code.
   * It uses the new saveColumnSettingsToStorage method internally but returns
   * data in the old format.
   *
   * @param storageKey - Key used to save configuration in local storage
   * @returns An object mapping column IDs to their order indices
   */
  saveColumnOrderToStorage(storageKey: string): { [key: string]: number } {
    this.saveColumnSettingsToStorage(storageKey);
    return this.saveColumnOrder();
  }

  /**
   * @openapi
   * @description Legacy method that loads column order from local storage.
   * This method is maintained for backward compatibility with older code.
   * It uses the new loadColumnSettingsFromStorage method internally but returns
   * data in the old format.
   *
   * @param storageKey - Key used to retrieve configuration from local storage
   * @returns An object mapping column IDs to their order indices, or null if no settings found
   */
  loadColumnOrderFromStorage(
    storageKey: string
  ): { [key: string]: number } | null {
    const columnSettings = this.loadColumnSettingsFromStorage(storageKey);

    if (!columnSettings) return null;

    const columnOrder: { [key: string]: number } = {};
    Object.keys(columnSettings).forEach((key) => {
      if (columnSettings[key].visible) {
        columnOrder[key] = columnSettings[key].index;
      }
    });

    return columnOrder;
  }

  /**
   * @openapi
   * @description Legacy alias for restoreDefaultColumnSettings.
   * This method is maintained for backward compatibility with older code.
   *
   * @param storageKey - Optional key to remove saved configuration from local storage
   */
  restoreDefaultColumnOrder(storageKey?: string): void {
    this.restoreDefaultColumnSettings(storageKey);
  }

  /**
   * @openapi
   * @description Handles the content ready event from the DevExtreme grid.
   * This method performs several initialization tasks:
   * 1. Emits the content ready event to parent components
   * 2. Sets up keyboard event listeners for selection behavior
   * 3. Configures mobile-specific grid settings
   * 4. Initializes sorting icons for column headers
   *
   * @param e - The content ready event object from DevExtreme grid
   */
  onContentReadyEvent(e: ContentReadyEvent) {
    try {
      this.onContentReady.emit(e);
      if (e?.element) {
        e.element.addEventListener("keyup", () => {
          this.isHold = false;
          if (this.timerSel) {
            clearTimeout(this.timerSel);
            this.timerSel = null;
          }
        });
      }

      this.sortingIcons.asc = Array.from(
        document.querySelectorAll(".header-sort-icon.arr-up") || []
      );
      this.sortingIcons.desc = Array.from(
        document.querySelectorAll(".header-sort-icon.arr-down") || []
      );
    } catch (error) {
      console.error("Błąd podczas obsługi zdarzenia contentReady:", error);
    }
  }

  /**
   * @openapi
   * @description Handles the grid initialization event.
   * This method sets up keyboard event listeners for selection behavior,
   * specifically handling the spacebar key for quick row selection/deselection.
   *
   * @param e - The initialization event object from DevExtreme grid
   */
  onInitializedEvent(e: InitializedEvent) {
    try {
      if (e?.element) {
        e.element.addEventListener("keyup", (event: KeyboardEvent) => {
          this.isHold = false;
          if (this.timerSel) {
            clearTimeout(this.timerSel);
            this.timerSel = null;
          }

          if (event.keyCode === 32 && this.isQuickPress) {
            const grid = e.component;
            const focusedRowKey = grid?.option("focusedRowKey");
            const isRowSelected = grid?.isRowSelected(focusedRowKey);
            if (grid && isRowSelected) {
              grid.deselectRows([focusedRowKey]);
              this.toDeselect.push(focusedRowKey);
            } else if (grid) {
              grid.selectRows([focusedRowKey], true);
              this.toSelect.push(focusedRowKey);
            }
          }

          this.isQuickPress = true;
        });
      }
    } catch (error) {
      console.error("Błąd podczas inicjalizacji grida:", error);
    }
  }

  /**
   * @openapi
   * @description Handles keyboard events in the grid.
   * This method prevents default behavior for specific keys (F2, Escape, Delete, Enter)
   * and emits the keydown event to parent components.
   *
   * @param event - The keyboard event object
   */
  onKeyDownEvent(event: KeyDownEvent) {
    try {
      const BLOCKED_KEYS = ["F2", "Escape", "Delete", "Enter", "Tab"];

      if (event.event?.key === "Tab") {
        this.onTab.emit(event);
      }
      if (event.event && BLOCKED_KEYS.includes(event.event.key)) {
        event.event.preventDefault();
      }

      this.onKeyDown.emit(event);
    } catch (error) {
      console.error("Błąd podczas obsługi zdarzenia keydown:", error);
    }
  }

  /**
   * @openapi
   * @description Handles row selection change events in the grid.
   * This method emits the selection changed event to parent components
   * when the user selects or deselects rows.
   *
   * @param e - The selection changed event object from DevExtreme grid
   */
  onSelectionChangedEvent(e: SelectionChangedEvent) {
    this.onSelectionChanged.emit(e);
    this.cdr.detectChanges();
  }

  /**
   * @openapi
   * @description Handles focused row changed events in the grid.
   * This method emits the focused row changed event to parent components
   * when the user focuses on a row.
   *
   * @param e - The focused row changed event object from DevExtreme grid
   */
  onFocusedRowChangedEvent(e: FocusedRowChangedEvent) {
    this.onFocusedRowChanged.emit(e);
  }

  /**
   * @openapi
   * @description Handles column header click events in the grid.
   * This method emits the column header click event to parent components
   * when the user clicks on a column header.
   *
   * @param column - The column object from DevExtreme grid
   */
  onColumnHeaderClickEvent(column: GenericGridColumn) {
    this.onColumnHeaderClick.emit(column.dataField);
  }
  /**
   * @openapi
   * @description Updates the dimensions of the grid.
   */
  updateDimensions() {
    this.dataGrid.instance.updateDimensions();
  }

  /**
   * @openapi
   * @description Handles column order click events in the grid.
   * This method emits the column order click event to parent components
   * when the user clicks on a column header to sort the data.
   *
   * @param column - The column object from DevExtreme grid
   */
  onOrderClickEvent() {
    this.onOrderClick.emit(this.order() === "ASC" ? "DESC" : "ASC");
  }

  /**
   * @openapi
   * @description Handles the columns chooser visible change event.
   * This method emits the columns chooser visible change event to parent components
   * when the user changes the visibility of the columns chooser.
   *
   * @param isVisible - The visibility of the columns chooser
   */
  onColumnsChooserVisibleChangeEvent(isVisible: boolean) {
    try {
      console.log("Zmiana widoczności wyboru kolumn:", isVisible);
      this.onColumnsChooserVisibleChange.emit(isVisible);
    } catch (error) {
      console.error("Błąd podczas zmiany widoczności wyboru kolumn:", error);
    }
  }

  /**
   * @openapi
   * @description Handles the editor preparing event in the grid.
   * This method removes the select command from the header row.
   *
   * @param e - The editor preparing event object from DevExtreme grid
   */
  onEditorPreparing(e: any) {
    if (e.parentType == "headerRow" && e.command == "select") {
      e.editorElement.remove();
    }
  }

  /**
   * @openapi
   * @description Handles the context menu preparing event in the grid.
   * This method removes the items from the context menu in the header row.
   *
   * @param e - The context menu preparing event object from DevExtreme grid
   */
  contextMenuPreparing(e: any): void {
    if (e.target == "header") {
      e.items = [];
    }
  }

  /**
   * @openapi
   * @description Handles cell click events in the grid.
   * This method removes the focus class from the cells and adds it to the clicked cell.
   *
   * @param e - The cell click event object from DevExtreme grid
   */
  onCellClick(e: any) {
    try {
      if (!e?.row?.cells) {
        return;
      }
      //e.cellElement.className += ' dx-focused';
    } catch (error) {
      console.error("Błąd podczas obsługi kliknięcia komórki:", error);
    }
  }

  /**
   * @openapi
   * @description Handles the row double click event in the grid.
   * This method emits the row double click event to parent components
   * when the user double clicks on a row.
   *
   * @param e - The row double click event object from DevExtreme grid
   */
  onRowDblClickEvent(e: any) {
    this.onRowDblClick.emit(e);
  }

  onReorder(e: any) {
    try {
      console.log("Zdarzenie reorder:", e);
    } catch (error) {
      console.error("Błąd podczas obsługi zdarzenia reorder:", error);
    }
  }

  /**
   * @openapi
   * @description Handles the row drag start event in the grid.
   * This method sets the highlight drop signal to true when a row is dragged.
   */
  highlightDrop = signal<boolean>(false);
  onDragStartRow = () => {
    this.highlightDrop.set(true);
  };

  /**
   * @openapi
   * @description Handles the row drag end event in the grid.
   * This method sets the highlight drop signal to false when a row is dragged.
   */
  onDragEndRow = () => {
    this.highlightDrop.set(false);
  };

  onExporting(e: DxDataGridTypes.ExportingEvent) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Zadania");

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "zadania.xlsx"
        );
      });
    });
  }
}
