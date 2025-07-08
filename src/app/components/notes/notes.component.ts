import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxDataGridModule,
  DxScrollViewModule,
  DxTextAreaModule,
} from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';
import { DxPopupModule } from 'devextreme-angular';
import { DxDropDownBoxModule } from 'devextreme-angular';
import { NoteService } from '../../services/note.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../services/event-services.service';
import { TranslateModule } from '@ngx-translate/core';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import { environment } from '../../../environments/environment';
import { Note } from '../../interface/note.interface';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { NewNotesComponent } from './new-notes/new-notes.component';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { GenericGridColumn, GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NotesComponent),
  multi: true,
};
@Component({
  selector: 'app-notes',
  imports: [
    CommonModule,
    DxScrollViewModule,
    DxButtonModule,
    DxPopupModule,
    DxScrollViewModule,
    TranslateModule,
    DxDataGridModule,
    NgShortcutsComponent,
    NewNotesComponent,
    ConfirmDialogComponent,
    DxTextAreaModule,
    DxDropDownBoxModule,
    GenericDataGridComponent
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class NotesComponent implements OnInit, AfterViewInit {
  @ViewChild('genericDataGrid') genericDataGrid: any;
  @ViewChild('dxGrid') dxGrid: any;
  @Input() dropDownMode: boolean = false;
  @Input() isIncome: boolean = false;
  @Output() onChoosed = new EventEmitter<Note>();
  @Input() readOnly: boolean = false;
  
  event = inject(EventService);
  translate = inject(TranslateService);
  noteService = inject(NoteService);

  mode: 'add' | 'edit' | 'show' = 'add';
  isAdd = signal<boolean>(false);
  dataSource: DataSource = new DataSource({});
  focusedElement = signal<Note | null>(null);
  focusedRowIndex: number = 0;
  pageSize: number = 30;
  heightGrid: number | string = 'calc(100vh - 220px)';
  selectedRows: Note[] = [];
  shortcuts: ShortcutInput[] = [];
  isDelete = signal<boolean>(false);
  cdr = inject(ChangeDetectorRef);
  isGridBoxOpened = signal<boolean>(false);
  dropDownHeight: number = 260;
  unicalGuid = Math.random().toString(36).substring(2, 15);
  dropdownTimeout: boolean = false;

  private _value: string = '';
  public get myValue(): string {
    return this._value;
  }
  public set myValue(v: string) {
    if (v !== this._value) {
      this._value = v;
      try {
        this.onChange(v);
      } catch (err) {}
    }
  }

  /** Opcje siatki klientów */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 100px)",
      } as GenericGridOptions)
  );

  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant("notes.text"),
          dataField: "TRESC",
          minWidth: 100,
          allowSorting: false,
        },
        {
          caption: this.translate.instant("notes.forIncome"),
          dataField: "DLAPRZYCHODU",
          width: 150,
          allowSorting: false,
          encodeHtml: false,
          cellTemplate: (e: any) => {
            return e.value ? '<img src="../../../assets/images/check-solid.svg" alt="" width="14" />' : '';
          }
        },
        {
          caption: this.translate.instant("notes.forexpenses"),
          dataField: "DLAROZCHODU",
          width: 150,
          allowSorting: false,
          encodeHtml: false,
          cellTemplate: (e: any) => {
            return e.value ? '<img src="../../../assets/images/check-solid.svg" alt="" width="14" />' : '';
          }
        }
      ] as GenericGridColumn[]
  );

  ngOnInit(): void {
    this.getData();
  }

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

  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'ID_UWAGA',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}notes`,
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

  getLoadParams() {
    let obj: any = {};
    if (this.isIncome) obj.isIncome = true;
    return obj;
  }

  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  onRowDblClick(e: any) {
    if (!this.dropDownMode) {
      this.onEdit();
      return;
    }

    if (!this.dropdownTimeout) this.onChoosingRow();
  }

  onEdit() {
    if (!this.event.sessionData.isActive) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }
  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  addNewRecord() {
    this.mode = 'add';
    this.isAdd.set(true);
  }

  onDeleteConfirm() {
    this.isDelete.set(true);
  }

  onShow() {
    this.mode = 'show';
    this.isAdd.set(true);
  }

  onSaving(event: any) {
    this.dataSource.reload().then((data) => {
      const index = data.findIndex(
        (item: any) => item.ID_UWAGA === Number(event.id.id)
      );
      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
    });
    this.isAdd.set(false);
  }

  delete() {
    if (!this.event.sessionData.isActive) return;

    const id = this.focusedElement()?.ID_UWAGA;
    if (!id) return;

    this.noteService.delete(id).subscribe({
      next: () => {
        this.getData();
        this.isDelete.set(false);
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  onInput() {
    this.cdr.detectChanges();
  }

  onClickArea() {
    this.isGridBoxOpened.set(!this.isGridBoxOpened());
  }

  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    this.myValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onChoosingRow() {
    this.isGridBoxOpened.set(false);
    this.onChoosed.emit(this.focusedElement() ?? undefined);
  }

  onSelectionChanged(event: any) {
    console.log(event);
  }

  onDropdownEditClick() {
    this.dropdownTimeout = true;
    this.onEdit();
    setTimeout(() => {
      this.dropdownTimeout = false;
    }, 200);
  }

  onDropdownOpened() {
    this.focusOnSelectedRow();
  }

  focusOnSelectedRow() {
    if (!this.selectedRows.length) return;

    const grid = this.dxGrid.instance;
    const selectedRowIndex = grid.getRowIndexByKey(this.selectedRows[0]);
    const selectedRowElement = grid.getRowElement(selectedRowIndex);
    grid.focus(selectedRowElement);
  }
}
