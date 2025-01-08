import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  input,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxTooltipModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import { EventService } from '../../../services/event-services.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { FlateRateService } from '../../../services/flateRate.services';
import { FlateRate } from '../../../interface/flateRate';

@Component({
  selector: 'app-new-flate-rate',
  standalone: true,
  imports: [
    DxPopupModule,
    DxButtonModule,
    DxTooltipModule,
    DxScrollViewModule,
    TranslateModule,
    DxTextBoxModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DxTextAreaModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    NgShortcutsComponent,
    DxNumberBoxModule,
    DxDateBoxModule,
  ],
  templateUrl: './new-flate-rate.component.html',
  styleUrl: './new-flate-rate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewFlateRateComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('inputDate') inputDate: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  fb = inject(FormBuilder);
  flateRate = input<any>();
  vatRegisterData = input<any>()

  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();

  title = this.translate.instant('toolbar.adding');
  form: FormGroup = new FormGroup({});
  shortcuts: ShortcutInput[] = [];

  flateRateService = inject(FlateRateService);

  constructor() {
    this.form = this.initForm();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flateRate']) {
      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        this.form.patchValue(this.flateRate());
      }

      if (this.mode() === 'show') {
        this.title = this.translate.instant('toolbar.preview');
        this.form.patchValue(this.flateRate());
        this.form.disable();
      }
    }

    if (changes['vatRegisterData']) {
      if (this.mode() === 'add') {
        this.form.patchValue({
          documentNumber: changes['vatRegisterData'].currentValue.documentNumber,
          dateOfEntry: changes['vatRegisterData'].currentValue.documentDate,
          dateOfReceipt: changes['vatRegisterData'].currentValue.taxLiabilityDate,
          vatRegisterId: changes['vatRegisterData'].currentValue.vatRegisterId,
        })
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
      dateOfEntry: [new Date(), Validators.required],
      dateOfReceipt: [new Date(), Validators.required],
      documentNumber: ['', Validators.required],
      totalRevenue: [0],
      isClose: [0],
      rate3: [0],
      rate5_5: [0],
      rate8_5: [0],
      rate10: [0],
      rate12: [0],
      rate12_5: [0],
      rate14: [0],
      rate15: [0],
      rate17: [0],
      remarks: [''],
      ryczaltId: [null],
      vatRegisterId: [null]
    });
  }

  onSave() {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.mode() === 'show') return;

    if (this.mode() === 'add') {
      this.flateRateService.post(this.form.value).subscribe({
        next: (data) => {
          this.onSaving.emit({
            data: this.form.value,
            flateRateId: data,
            mode: 'add',
          });
        },
        error: (err) => {
          this.event.httpErrorNotification(err);
        },
      });

      return;
    }

    this.flateRateService.put(this.form.value).subscribe({
      next: (data) => {
        this.onSaving.emit({
          data: this.form.value,
          flateRateId: data,
          mode: 'edit',
        });
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }
}
