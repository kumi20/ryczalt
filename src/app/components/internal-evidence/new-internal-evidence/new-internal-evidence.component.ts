import {
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxSelectBoxModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxTooltipModule,
  DxTextAreaModule,
} from 'devextreme-angular';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EventService } from '../../../services/event-services.service';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { InternalEvidence } from '../../../interface/internalEvidence';
import { InternalEvidenceService } from '../../../services/internal-evidence.service';

@Component({
  selector: 'app-new-internal-evidence',
  templateUrl: './new-internal-evidence.component.html',
  styleUrls: ['./new-internal-evidence.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    DxScrollViewModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxNumberBoxModule,
    DxPopupModule,
    DxTooltipModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class NewInternalEvidenceComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('inputDate') inputDate: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  fb = inject(FormBuilder);

  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();

  title = this.translate.instant('toolbar.adding');
  form: FormGroup = new FormGroup({});
  shortcuts: ShortcutInput[] = [];
  internalEvidence = input<any>();

  internalEvidenceService = inject(InternalEvidenceService);

  typeList = [
    { id: true, name: this.translate.instant('internalEvidence.income') },
    { id: false, name: this.translate.instant('internalEvidence.expense') },
  ];

  taxRates: string[] = [
    '',
    '3%',
    '5.5%',
    '8.5%',
    '10%',
    '17%',
    '20%',
    '12.5%',
    '15%',
    '12%',
    '14%'
  ];

  constructor() {
    this.form = this.initForm();
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['internalEvidence']) {
      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        this.form.patchValue(this.internalEvidence());
      }

      if (this.mode() === 'show') {
        this.title = this.translate.instant('toolbar.preview');
        this.form.patchValue(this.internalEvidence());
        this.form.disable();
      }
    }
  }

  ngOnDestroy(): void {
    this.event.onHiddenPopUp();
  }

  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: 'escape',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (e) => {
          this.onClosing.emit(true);
        },
      },
      {
        key: 'ctrl + s',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (e) => {
          this.onSave();
        },
      },
    ];
  }

  initForm() {
    return this.fb.group({
      internalEvidenceId: [null],
      isCoast: [true],
      documentNumber: ['', Validators.required],
      documentDate: [new Date(), Validators.required],
      description: [null, Validators.required],
      amount: [1, Validators.required],
      price: ['', [
        Validators.required,
        Validators.min(0.01)
      ]],
      unit: [null],
      personIssuing: [''],
      taxVat: [''],
      remarks: [''],
      isBooked: [false],
      isClosed: [false],
    });
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

  parseToInt() {
    this.form.controls['isBooked'].setValue(this.form.value.isBooked ? 1 : 0);
    this.form.controls['isClosed'].setValue(this.form.value.isClosed ? 1 : 0);
  }

  onSave() {
    this.form.markAllAsTouched();

    this.parseToInt();

    if (this.form.invalid || this.mode() === 'show') return;

    if (this.mode() === 'add') {
      this.internalEvidenceService.post(this.form.value).subscribe({
        next: (data) => {
          this.onSaving.emit({
            data: this.form.value,
            internalEvidenceId: data,
            mode: 'add',
          });
        },
        error: (err) => {
          this.event.httpErrorNotification(err);
        },
      });

      return;
    }

    this.internalEvidenceService.put(this.form.value).subscribe({
      next: (data) => {
        this.onSaving.emit({
          data: this.form.value,
          internalEvidenceId: data,
          mode: 'edit',
        });
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }
}
