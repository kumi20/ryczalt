import {
  DxButtonModule,
  DxDataGridComponent,
  DxListModule,
  DxPopupModule,
} from 'devextreme-angular';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/event-services.service';
import { ColumnChooserColumn, RawColumn } from './column-chooser.model';
import { ItemReorderedEvent } from 'devextreme/ui/list';
import { TitleRenderedEvent } from 'devextreme/ui/popup';

@Component({
  selector: 'app-column-chooser',
  templateUrl: './column-chooser.component.html',
  styleUrls: ['./column-chooser.component.scss'],
  standalone: true,
  imports: [DxPopupModule, TranslateModule, DxButtonModule, DxListModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnChooserComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() gridRef: DxDataGridComponent | null = null;
  @Input() rawColumns: RawColumn[] | null = null;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() columnsChanged: EventEmitter<ColumnChooserColumn[] | RawColumn[]> =
    new EventEmitter();

  baseColumns: ColumnChooserColumn[] = [];
  columns: ColumnChooserColumn[] = [];
  visibleColumns: string[] = [];
  visibleRawColumns: string[] = [];
  unicalGuid = new Date().getTime() + Math.round(Math.random() * 10000);
  fullScreen: boolean = false;
  height = 'calc(70vh - 125px)';

  constructor(
    public event: EventService,
    public translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['rawColumns']?.currentValue) {
      if (this.rawColumns === null) return;
      this.visibleRawColumns = this.rawColumns
        .filter((el) => el.checked)
        .map((col) => col.name);
    }
    if (changes?.['visible']?.currentValue && this.gridRef) {
      this.getColumns();
    }
  }

  fullScreenChange = (e: boolean) => {
    this.height = e ? 'calc(100vh - 125px)' : 'calc(70vh - 125px)';
  };

  mapColumn(col: any): ColumnChooserColumn {
    return {
      name: col.dataField,
      caption: col.caption,
      visibleIndex: col.visibleIndex,
      checked: col.visible,
      width: col.width,
      allowReordering: col.allowReordering,
    };
  }

  // columnoption zwraca typ any - nie ma jak nadac typow
  mapColumnKey(col: any): string {
    return col.dataField;
  }

  getColumns() {
    if (this.gridRef === null) return;

    const instance = this.gridRef.instance;
    const columnCount = instance.columnCount();
    this.columns = [];
    this.visibleColumns = [];

    for (let i = 0; i < columnCount; i++) {
      this.columns.push(this.mapColumn(instance.columnOption(i)));
      if (instance.columnOption(i, 'visible')) {
        this.visibleColumns.push(this.mapColumnKey(instance.columnOption(i)));
      }
    }

    this.baseColumns = JSON.parse(JSON.stringify(this.columns));
    this.columns.sort((a, b) => a.visibleIndex - b.visibleIndex);
  }

  saveColumns = () => {
    if (this.rawColumns) {
      this.rawColumns.forEach((el) => {
        if (this.visibleRawColumns === null) return;
        el.checked = this.visibleRawColumns.indexOf(el.name) !== -1;
      });
      this.columnsChanged.emit(this.rawColumns);
      this.hideColumnsConfig();
      return;
    }

    if (this.gridRef === null) return;
    const instance = this.gridRef.instance;

    this.columns.forEach((col, i) => {
      const foundVisible = this.getVisibleCol(col.name);
      col.checked = foundVisible;
      instance.columnOption(col.caption, 'visible', foundVisible);
      instance.columnOption(col.caption, 'visibleIndex', i);
      instance.columnOption(col.caption, 'width', col.width);
    });

    const newCols: ColumnChooserColumn[] = this.columns.map((col) => {
      return {
        name: col.name,
        dataField: col.name,
        caption: col.caption,
        visibleIndex: col.visibleIndex,
        visible: col.checked,
        width: col.width,
      };
    });
    this.columnsChanged.emit(newCols);
    this.hideColumnsConfig();
  };

  getVisibleCol(name: string): boolean {
    return this.visibleColumns.findIndex((col) => col === name) > -1;
  }

  hideColumnsConfig() {
    this.visibleChange.emit(false);
  }

  onReorder = (e: ItemReorderedEvent) => {
    if (this.rawColumns) {
      const tmp = this.rawColumns[e.fromIndex];
      this.rawColumns[e.fromIndex] = this.rawColumns[e.toIndex];
      this.rawColumns[e.toIndex] = tmp;
      return;
    }

    if (!this.columns[e.fromIndex].allowReordering) {
      this.event.showNotification(
        'error',
        this.translate.instant('cantReorderColumn')
      );
      return;
    }
    const tmp = this.columns[e.fromIndex];
    this.columns[e.fromIndex] = this.columns[e.toIndex];
    this.columns[e.toIndex] = tmp;
  };

  onTitleRendered(event: TitleRenderedEvent) {
    event.titleElement.classList.value += ' column-popup-title';
  }

  resetColumns() {
    if (this.rawColumns) {
      this.rawColumns.forEach((el) => (el.checked = true));
      return;
    }
    this.baseColumns.forEach((col, i) => {
      col.visibleIndex = i;
      col.width = 'auto';
      col.checked = true;
    });
    this.columns = JSON.parse(JSON.stringify(this.baseColumns));
    this.visibleColumns = this.baseColumns.map((col) => col.name);
  }

  toggleFullScreen() {
    this.fullScreen = !this.fullScreen;
  }
}
