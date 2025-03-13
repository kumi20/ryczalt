import { Component, EventEmitter, HostListener, inject, input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxScrollViewModule, DxTooltipModule, DxTextAreaModule, DxCheckBoxModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';
import { DxPopupModule } from 'devextreme-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DxDataGridModule } from 'devextreme-angular';
import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput, ShortcutEventOutput } from 'ng-keyboard-shortcuts';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../services/event-services.service';
import { NoteService } from '../../../services/note.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-new-notes',
  templateUrl: './new-notes.component.html',
  imports: [
    CommonModule,
    DxScrollViewModule,
    DxButtonModule,
    DxPopupModule,
    DxScrollViewModule,
    TranslateModule,
    DxDataGridModule,
    NgShortcutsComponent,
    DxTooltipModule,
    ReactiveFormsModule,
    DxTextAreaModule,
    DxCheckBoxModule,
  ],
})
export class NewNotesComponent {
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('inputDate') inputDate: any;
  @ViewChild('firstFocus') firstFocus: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  fb = inject(FormBuilder);
  notes = input<any>();

  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();

  title = this.translate.instant('toolbar.adding');
  form: FormGroup = new FormGroup({});
  shortcuts: ShortcutInput[] = [];

  noteService = inject(NoteService);

  constructor() {
    this.form = this.initForm();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notes']) {
      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        this.form.patchValue(this.notes());
      }

      if (this.mode() === 'show') {
        this.title = this.translate.instant('toolbar.preview');
        this.form.patchValue(this.notes());
        this.form.disable();
      }
    }
  }

  ngOnDestroy(): void {
    this.event.onHiddenPopUp();
  }

  setFocus(){
    setTimeout(() => {
      this.firstFocus.instance.focus();
    }, 200);
  }

  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: 'escape',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (e: ShortcutEventOutput) => {
          this.onClosing.emit(true);
        },
      },
      {
        key: 'ctrl + s',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (e: ShortcutEventOutput) => {
          this.onSave();
        },
      },
    ];
  }

  closeWindow() {
    this.onClosing.emit(true);
  }

  onVisibleChange(e: any) {
    if (!e) {
      this.onClosing.emit(true);
    }
  }

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  initForm(): FormGroup {
    return this.fb.group({
      ID_UWAGA: [null],
      TRESC: ['', Validators.required],
      DLAPRZYCHODU: [false],
      DLAROZCHODU: [false],
    });
  }

  onSave() {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.mode() === 'show') return;

    if (this.mode() === 'add') {
      this.noteService.post(this.form.value).subscribe({
        next: (data: any) => {
          this.onSaving.emit({
            data: this.form.value,
            id: data,
            mode: 'add',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.event.httpErrorNotification(err);
        },
      });

      return;
    }

    this.noteService.put(this.form.value).subscribe({
      next: (data: any) => {
        this.onSaving.emit({
          data: this.form.value,
          id: data,
          mode: 'edit',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeWindow();
  }
}
