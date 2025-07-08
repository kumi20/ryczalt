import {
  ColumnFixing,
  ColumnResizeMode,
  Column as DxDataGridColumn,
  Editing,
  Grouping,
  Pager,
  Paging,
  RowDragging,
  Scrolling,
  Selection,
} from 'devextreme/ui/data_grid';

// Interfejs rozszerzający standardową kolumnę DevExtreme
export interface GenericGridColumn extends DxDataGridColumn {
  isAllowSorting?: true; // Czy kolumna ma być sortowalna
  name?: string; // Nazwa kolumny używana do identyfikacji
  templateName?: string; // Nazwa szablonu dla cellTemplate
  headerTemplateName?: string; // Nazwa szablonu dla headerCellTemplate
  groupTemplateName?: string; // Nazwa szablonu dla groupCellTemplate
  editTemplateName?: string; // Nazwa szablonu dla editCellTemplate
  cellTemplate?: (cellData: any) => string; // Dynamiczny szablon komórki jako funkcja zwracająca string
  headerHtmlTemplate?: string; // Zawartość HTML dla szablonu nagłówka
  headerClickHandler?: (event: any) => void; // Obsługa zdarzenia kliknięcia dla nagłówka
  headerTooltip?: string; // Treść tooltipa dla nagłówka kolumny
}

// Interfejs opisujący szablon przekazywany do komponentu
export interface GenericGridTemplate {
  name: string; // Nazwa szablonu, która będzie przypisana do templateName w kolumnie
  template: any; // Referencja do szablonu TemplateRef<any>
}

// Interfejs dla konfiguracji opcji siatki
export interface GenericGridOptions {
  dxExport?:boolean;
  allowColumnReordering?: boolean;
  allowColumnResizing?: boolean;
  autoFocus?: boolean; // Automatyczne ustawienie fokusu po załadowaniu grida
  columnFixing?: ColumnFixing
  columnResizingMode?: ColumnResizeMode;
  editing?: Editing
  focusedRowEnabled?: boolean;
  grouping?: Grouping;
  height?: string | number;
  keyExpr?: string | string[]; // Wyrażenie klucza dla unikalnej identyfikacji wierszy
  pager?: Pager;
  paging?: Paging;
  remoteOperations?: boolean;
  rowAlternationEnabled?: boolean;
  rowDragging?: RowDragging;
  selection?: Selection;
  scrolling?: Scrolling;
  showBorders?: boolean;
  showColumnHeaders?: boolean;
  showColumnLines?: boolean;
  showRowLines?: boolean;
  width?: string | number;
  wordWrapEnabled?: boolean;
}
