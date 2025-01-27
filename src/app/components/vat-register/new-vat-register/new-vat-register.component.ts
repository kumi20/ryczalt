import {
  Component,
  Output,
  ViewChild,
  EventEmitter,
  inject,
  input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  AfterViewInit,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxTextBoxModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { EventService } from '../../../services/event-services.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { DocumentTypeComponent } from '../../document-type/document-type.component';
import { CustomersComponent } from '../../customers/customers.component';
import { CommonModule } from '@angular/common';
import { VatRegisterService } from '../../../services/vatRegister.service';
import { FlateRate } from '../../../interface/flateRate';
import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';

@Component({
  selector: 'app-new-vat-register',
  standalone: true,
  imports: [
    DxPopupModule,
    DxButtonModule,
    DxTooltipModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DocumentTypeComponent,
    CustomersComponent,
    DxNumberBoxModule,
    DxCheckBoxModule,
    CommonModule,
    NgShortcutsComponent,
  ],
  templateUrl: './new-vat-register.component.html',
  styleUrl: './new-vat-register.component.scss',
})
export class NewVatRegisterComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('inputDate') inputDate: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  fb = inject(FormBuilder);
  vatRegister = input<any>();
  vatRegisterService = inject(VatRegisterService);

  title = this.translate.instant('toolbar.adding');
  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();
  vatRegisterFlate = input<FlateRate | null>();
  shortcuts: ShortcutInput[] = [];
  form: FormGroup = new FormGroup({});
  cdr = inject(ChangeDetectorRef);

  constructor() {
    this.form = this.initForm();
  }

  ngOnInit(): void {}

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
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vatRegister']) {
      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        this.form.patchValue(this.vatRegister());
      }

      if (this.mode() === 'show') {
        this.title = this.translate.instant('toolbar.preview');
        this.form.patchValue(this.vatRegister());
        this.form.disable();
      }
    }

    if (changes['vatRegisterFlate']) {
      if (this.mode() === 'add') {
        this.form.patchValue({
          documentNumber:
            changes['vatRegisterFlate'].currentValue.documentNumber,
          documentDate: changes['vatRegisterFlate'].currentValue.dateOfEntry,
          dateOfSell: changes['vatRegisterFlate'].currentValue.dateOfEntry,
          taxLiabilityDate:
            changes['vatRegisterFlate'].currentValue.dateOfReceipt,
          rate23Net:
            changes['vatRegisterFlate'].currentValue.rate3 +
            changes['vatRegisterFlate'].currentValue.rate5_5 +
            changes['vatRegisterFlate'].currentValue.rate8_5 +
            changes['vatRegisterFlate'].currentValue.rate10 +
            changes['vatRegisterFlate'].currentValue.rate12 +
            changes['vatRegisterFlate'].currentValue.rate12_5 +
            changes['vatRegisterFlate'].currentValue.rate14 +
            changes['vatRegisterFlate'].currentValue.rate15 +
            changes['vatRegisterFlate'].currentValue.rate17,
            ryczaltId: changes['vatRegisterFlate'].currentValue.ryczaltId,
        });

        this.countGross(
          'rate23Gross',
          'rate23Vat',
          { value: this.form.value.rate23Net },
          23
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.event.onHiddenPopUp();
  }

  initForm(): FormGroup {
    return this.fb.group({
      vatRegisterId: [null],
      documentTypeId: [1, Validators.required],
      documentDate: [new Date(), Validators.required],
      taxLiabilityDate: [new Date(), Validators.required],
      dateOfSell: [new Date(), Validators.required],
      documentNumber: ['', Validators.required],
      customerId: [null, Validators.required],
      rate23Net: [0],
      rate23Vat: [0],
      rate23Gross: [0],
      rate8Net: [0],
      rate8Vat: [0],
      rate8Gross: [0],
      rate5Net: [0],
      rate5Vat: [0],
      rate5Gross: [0],
      rate0: [0],
      export0: [0],
      wdt0: [0],
      wsu: [0],
      exemptSales: [0],
      reverseCharge: [0],
      isDelivery: [0],
      isServices: [0],
      isCustomerPayer: [0],
      isThreeSided: [0],
      ryczaltId: [null],
      isSell: [1],
      isClosed: [0],
    });
  }

  onVisibleChange(e: any) {
    if (!e) {
      this.onClosing.emit(true);
    }
  }

  closeWindow() {
    this.onClosing.emit(true);
  }

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  countGross(gross: string, vat: string, e: any, rate: number) {
    const grossAmount = this.event.countAmountGross(e.value, rate);
    const vatAmount = grossAmount - e.value;

    this.form.controls[gross].setValue(grossAmount);
    this.form.controls[vat].setValue(vatAmount);
  }

  countNett(nett: string, vat: string, e: any, rate: number) {
    const netAmount = this.event.countAmountNet(e.value, rate);
    const vatAmount = e.value - netAmount;

    this.form.controls[nett].setValue(netAmount);
    this.form.controls[vat].setValue(vatAmount);
  }

  onChoosedCustomer(e: any) {
    this.form.controls['customerId'].setValue(e.customerId);
  }

  onChoosedDocumentType(e: any) {
    this.form.controls['documentTypeId'].setValue(e.documentTypeId);
  }

  onSave() {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.mode() === 'show') return;

    if (this.mode() === 'add') {
      this.vatRegisterService.post(this.form.value).subscribe({
        next: (data) => {
          this.onSaving.emit({
            data: this.form.value,
            vatRegisterId: data,
            mode: 'add',
          });
        },
        error: (err) => {
          this.event.httpErrorNotification(err);
        },
      });
    }

    if (this.mode() === 'edit') {
      this.vatRegisterService.put(this.form.value).subscribe({
        next: (data) => {
          this.onSaving.emit({
            data: this.form.value,
            vatRegisterId: data,
            mode: 'edit',
          });
        },
        error: (err) => {
          this.event.httpErrorNotification(err);
        },
      });
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeWindow();
  }
}
