import {
  Component,
  inject,
  input,
  signal,
  SimpleChanges,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  EventEmitter,
  Output,
  HostListener,
  Input,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { DxPopupModule } from 'devextreme-angular';
import { EventService } from '../../../services/event-services.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { FlatRateTaxService } from '../../../services/flat-rate-tax.service';
import { FlatRateTax } from '../../../interface/flatRateTax';

@Component({
  selector: 'app-new-flat-rate-tax',
  standalone: true,
  imports: [
    DxPopupModule,
    DxButtonModule,
    DxScrollViewModule,
    TranslateModule,
    NgShortcutsComponent,
    CommonModule,
    DxButtonModule,
    DxTooltipModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxCheckBoxModule,
  ],
  templateUrl: './new-flat-rate-tax.component.html',
  styleUrl: './new-flat-rate-tax.component.scss',
})
export class NewFlatRateTaxComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @Input() flatRateTax: FlatRateTax | null = null;
  @ViewChild('firstSelect') firstSelect: any;
  event = inject(EventService);

  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();

  translate = inject(TranslateService);
  title = this.translate.instant('toolbar.adding');
  shortcuts: ShortcutInput[] = [];
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  flatRateTaxService = inject(FlatRateTaxService);

  form = this.fb.group({
    month: [this.event.globalDate.month, Validators.required],
    year: [this.event.globalDate.year, Validators.required],
    flatRateTaxId: [0],
    income: [0, Validators.required],
    reductionAmountPreviousMonth: [0],
    socialInsurance: [0, Validators.required],
    reductionAmountHealt: [0],
    baseTax: [0],
    reduceTaxPreviousMonth: [0],
    reduceTaxNextMonth: [0],
    transferHealt: [0],
    amountFlatRateTax: [0],
    dataPayment: [null],
    isPaid: [false],
  });

  calculateTaxData: any;
  isFirstTime: boolean = true;

  ngOnInit(): void {
    this.calculate();
    this.setPaymentDate();
  }

  calculateTax() {
    // Obliczanie całkowitego przychodu
    const formValues = this.form.value;
    if (
      !formValues.income ||
      !formValues.socialInsurance ||
      !formValues.reductionAmountHealt
    ) {
      return null;
    }

    // Obliczanie podstawy opodatkowania
    const baseTax = Math.round(
      this.calculateTaxData.baseTax -
        Number(this.form.value.reductionAmountPreviousMonth)
    );
    this.form.controls['baseTax'].setValue(baseTax);
    // Obliczanie proporcji dla każdej stawki
    const tax17 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax17 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.17
        : 0;
    const tax15 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax15 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.15
        : 0;
    const tax14 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax14 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.14
        : 0;
    const tax12_5 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax12_5 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.125
        : 0;
    const tax12 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax12 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.12
        : 0;
    const tax10 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax10 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.1
        : 0;
    const tax8_5 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax8_5 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.085
        : 0;
    const tax5_5 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax5_5 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.055
        : 0;
    const tax3 =
      Number(this.form.value.income) > 0
        ? ((this.calculateTaxData.details.tax3 ?? 0) /
            Number(this.form.value.income)) *
          baseTax *
          0.03
        : 0;

    // Suma podatku przed odliczeniami
    const totalTax = Math.round(
      tax17 +
        tax15 +
        tax14 +
        tax12_5 +
        tax12 +
        tax10 +
        tax8_5 +
        tax5_5 +
        tax3 -
        Number(this.form.value.reduceTaxPreviousMonth)
    );
    this.form.controls['amountFlatRateTax'].setValue(totalTax);
    return totalTax;
  }

  calculate() {
    this.flatRateTaxService
      .calculate(
        this.form.value.month as number,
        this.form.value.year as number
      )
      .subscribe({
        next: (data) => {
          this.calculateTaxData = data;

          if (this.mode() === 'add') {
            this.form.patchValue({
              baseTax: this.calculateTaxData.baseTax,
              amountFlatRateTax: this.calculateTaxData.amountFlatRateTax,
              reduceTaxNextMonth: this.calculateTaxData.reduceTaxNextMonth,
              income: this.calculateTaxData.income,
              socialInsurance: this.calculateTaxData.socialInsurance,
              reductionAmountHealt: this.calculateTaxData.reductionAmountHealt,
              reduceTaxPreviousMonth:
                this.calculateTaxData.reduceTaxPreviousMonth,
            });
          }
          this.isFirstTime = false;
        },
        error: (err) => {
          this.event.httpErrorNotification(err);
        },
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flatRateTax']) {
      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        if (this.flatRateTax) this.form.patchValue(this.flatRateTax as any);
      }

      if (this.mode() === 'show') {
        this.form.patchValue(this.flatRateTax as any);
        this.title = this.translate.instant('toolbar.show');
      }
    }
  }

  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: 'escape',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (e) => {
          this.closeWindow();
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
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.event.onHiddenPopUp();
  }

  closeWindow() {
    this.onClosing.emit(true);
  }

  onVisibleChange(e: any) {
    if (!e) {
      this.onClosing.emit(true);
    }
  }
  setFocus() {
    setTimeout(() => {
      this.firstSelect.instance.focus();
    }, 200);
  }

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  initForm() {
    this.calculate();
    this.setPaymentDate();
  }

  onSave() {
    if (this.form.invalid) return;

    this.firstSelect.instance.focus();
    if (this.mode() === 'add') {
      this.calculateTax();
      this.flatRateTaxService.post(this.form.value).subscribe(
        (response) => {
          this.onSaving.emit(response);
        },
        (error) => {
          this.event.httpErrorNotification(error);
        }
      );
      return;
    }

    this.flatRateTaxService.put(this.form.value).subscribe(
      (response) => {
        this.onSaving.emit(response);
      },
      (error) => {
        this.event.httpErrorNotification(error);
      }
    );
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeWindow();
  }

  setPaymentDate() {
    const month = this.form.value.month as number;
    const year = this.form.value.year as number;

    let paymentYear = year;
    let paymentMonth = month + 1;

    if (month === 12) {
      paymentYear++;
      paymentMonth = 1;
    }

    const paymentDate = new Date(paymentYear, paymentMonth - 1, 20);
    this.form.controls['dataPayment'].setValue(paymentDate as any);
  }
}
