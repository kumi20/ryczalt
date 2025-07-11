import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
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

/**
 * Notes management component that provides functionality for managing notes/annotations.
 * 
 * This component serves as both a standalone notes manager and a dropdown selector for notes.
 * It supports full CRUD operations, keyboard shortcuts, and can be used in both regular and dropdown modes.
 * 
 * @example
 * ```html
 * <!-- Standalone notes manager -->
 * <app-notes></app-notes>
 * 
 * <!-- Dropdown selector -->
 * <app-notes [dropDownMode]="true" [isIncome]="true" (onChoosed)="onNoteSelected($event)"></app-notes>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
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
export class NotesComponent implements OnInit, AfterViewInit, OnDestroy {
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
  private deviceTypeSubscription?: Subscription;

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
          caption: this.translate.instant("notes.text"),
          dataField: "TRESC",
          minWidth: 200,
          allowSorting: false,
          hidingPriority: 1,
        },
        {
          caption: this.translate.instant("notes.forIncome"),
          dataField: "DLAPRZYCHODU",
          width: 150,
          minWidth: 120,
          allowSorting: false,
          encodeHtml: false,
          hidingPriority: 2,
          cellTemplate: (e: any) => {
            return e.value ? '<img src="../../../assets/images/check-solid.svg" alt="" width="14" />' : '';
          }
        },
        {
          caption: this.translate.instant("notes.forexpenses"),
          dataField: "DLAROZCHODU",
          width: 150,
          minWidth: 120,
          allowSorting: false,
          encodeHtml: false,
          hidingPriority: 3,
          cellTemplate: (e: any) => {
            return e.value ? '<img src="../../../assets/images/check-solid.svg" alt="" width="14" />' : '';
          }
        }
      ] as GenericGridColumn[]
  );

  /**
   * Initializes the component by loading notes data and setting up device type subscription.
   * 
   * Sets up the initial data source and subscribes to device type changes for responsive behavior.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  ngOnInit(): void {
    this.getData();
    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  /**
   * Initializes keyboard shortcuts after view initialization.
   * 
   * Sets up keyboard shortcuts for common operations:
   * - Alt+N: Add new record
   * - F2: Edit current record (Shift+F2 for view mode)
   * - Del: Delete current record
   * 
   * @returns {void}
   * @memberof NotesComponent
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
   * Initializes and configures the data source for notes.
   * 
   * Creates a DevExtreme DataSource with AspNetData store configuration for server-side data operations.
   * Sets up loading parameters, error handling, and focus management after data load.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
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

  /**
   * Generates parameters for data loading based on current filter state.
   * 
   * Creates an object with filtering parameters that will be sent to the server.
   * Currently supports filtering by income type.
   * 
   * @returns {any} Object containing load parameters for the data source
   * @memberof NotesComponent
   */
  getLoadParams() {
    let obj: any = {};
    if (this.isIncome) obj.isIncome = true;
    return obj;
  }

  /**
   * Handles focused row change events in the data grid.
   * 
   * Updates the currently focused element when user navigates through the grid.
   * 
   * @param {any} event - The focused row change event containing row data
   * @returns {void}
   * @memberof NotesComponent
   */
  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  /**
   * Handles key down events to prevent default behavior for specific keys.
   * 
   * Blocks default behavior for keys that are handled by custom keyboard shortcuts.
   * 
   * @param {any} event - The key down event object
   * @returns {void}
   * @memberof NotesComponent
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Handles double-click events on grid rows.
   * 
   * In normal mode, opens the edit dialog. In dropdown mode, selects the row.
   * Uses timeout protection to prevent accidental selections.
   * 
   * @param {any} e - The double-click event object
   * @returns {void}
   * @memberof NotesComponent
   */
  onRowDblClick(e: any) {
    if (!this.dropDownMode) {
      this.onEdit();
      return;
    }

    if (!this.dropdownTimeout) this.onChoosingRow();
  }

  /**
   * Initiates edit mode for the currently focused note.
   * 
   * Checks if session is active, sets mode to edit, updates focused element,
   * and opens the edit dialog.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onEdit() {
    if (!this.event.sessionData.isActive) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }
  /**
   * Retrieves the currently focused row data from the grid.
   * 
   * @returns {any} The focused row data object
   * @memberof NotesComponent
   */
  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  /**
   * Initiates the process of adding a new note.
   * 
   * Sets the component to add mode and opens the add dialog.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  addNewRecord() {
    this.mode = 'add';
    this.isAdd.set(true);
  }

  /**
   * Shows the delete confirmation dialog.
   * 
   * Opens a confirmation dialog to verify the user's intention to delete the selected note.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onDeleteConfirm() {
    this.isDelete.set(true);
  }

  /**
   * Initiates view mode for the currently focused note.
   * 
   * Sets the component to show mode and opens the view dialog (read-only).
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onShow() {
    this.mode = 'show';
    this.isAdd.set(true);
  }

  /**
   * Handles the saving event after a note has been saved.
   * 
   * Reloads the data source and positions the focus on the saved record.
   * If the saved record is not found, focuses on the first row.
   * 
   * @param {any} event - The save event containing the saved record's ID
   * @returns {void}
   * @memberof NotesComponent
   */
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

  /**
   * Deletes the currently focused note after confirmation.
   * 
   * Checks if session is active and if a note is selected before proceeding.
   * Calls the note service to delete the record and refreshes the data on success.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
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

  /**
   * Handles input events and triggers change detection.
   * 
   * Used for reactive form controls to ensure proper UI updates.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onInput() {
    this.cdr.detectChanges();
  }

  /**
   * Toggles the dropdown grid box open/closed state.
   * 
   * Used in dropdown mode to show/hide the grid selection area.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onClickArea() {
    this.isGridBoxOpened.set(!this.isGridBoxOpened());
  }

  onChange = (value: string) => {};
  onTouched = () => {};

  /**
   * Writes a value to the component (ControlValueAccessor implementation).
   * 
   * Part of the Angular ControlValueAccessor interface for form integration.
   * 
   * @param {string} value - The value to write to the component
   * @returns {void}
   * @memberof NotesComponent
   */
  writeValue(value: string): void {
    this.myValue = value;
  }

  /**
   * Registers a callback function for value changes (ControlValueAccessor implementation).
   * 
   * @param {any} fn - The callback function to register
   * @returns {void}
   * @memberof NotesComponent
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function for touched events (ControlValueAccessor implementation).
   * 
   * @param {any} fn - The callback function to register
   * @returns {void}
   * @memberof NotesComponent
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Handles row selection in dropdown mode.
   * 
   * Closes the dropdown and emits the selected note to parent components.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onChoosingRow() {
    this.isGridBoxOpened.set(false);
    this.onChoosed.emit(this.focusedElement() ?? undefined);
  }

  /**
   * Handles selection change events in the grid.
   * 
   * Currently logs the event for debugging purposes.
   * 
   * @param {any} event - The selection change event
   * @returns {void}
   * @memberof NotesComponent
   */
  onSelectionChanged(event: any) {
    console.log(event);
  }

  /**
   * Handles edit button click in dropdown mode.
   * 
   * Sets a timeout flag to prevent accidental row selection and opens edit mode.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onDropdownEditClick() {
    this.dropdownTimeout = true;
    this.onEdit();
    setTimeout(() => {
      this.dropdownTimeout = false;
    }, 200);
  }

  /**
   * Handles dropdown opened event.
   * 
   * Focuses on the currently selected row when the dropdown opens.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  onDropdownOpened() {
    this.focusOnSelectedRow();
  }

  /**
   * Focuses on the currently selected row in the grid.
   * 
   * Used to maintain focus state when dropdown is opened.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  focusOnSelectedRow() {
    if (!this.selectedRows.length) return;

    const grid = this.dxGrid.instance;
    const selectedRowIndex = grid.getRowIndexByKey(this.selectedRows[0]);
    const selectedRowElement = grid.getRowElement(selectedRowIndex);
    grid.focus(selectedRowElement);
  }

  /**
   * Cleanup method called when component is destroyed.
   * 
   * Unsubscribes from device type changes to prevent memory leaks.
   * 
   * @returns {void}
   * @memberof NotesComponent
   */
  ngOnDestroy(): void {
    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();
    }
  }

  /**
   * Retrieves data items for mobile view rendering.
   * 
   * Provides data items specifically formatted for mobile display.
   * 
   * @returns {any[]} Array of data items for mobile view
   * @memberof NotesComponent
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
   * Updates the focused element and triggers focused row change handling.
   * 
   * @param {any} item - The clicked item data
   * @param {number} index - The index of the clicked item
   * @returns {void}
   * @memberof NotesComponent
   */
  onMobileItemClick(item: any, index: number) {
    this.focusedElement.set(item);
    this.focusedRowIndex = index;
    this.onFocusedRowChanged({row: {data: item}});
  }
}
