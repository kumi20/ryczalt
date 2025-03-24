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
  DxTabPanelModule,
  DxTooltipModule,
  DxSelectBoxModule
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

import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { FlateRate } from '../../../interface/flateRate';

@Component({
  selector: 'app-new-vat-register-buy',
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
    DxSelectBoxModule,
    NgShortcutsComponent,
    DxTabPanelModule
  ],
  templateUrl: './new-vat-register-buy.component.html',
  styleUrl: './new-vat-register-buy.component.scss'
})
export class NewVatRegisterBuyComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('inputDate') inputDate: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  vatRegister = input<any>();
  vatRegisterService = inject(VatRegisterService);

  title = this.translate.instant('toolbar.adding');
  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();
  vatRegisterFlate = input<FlateRate | null>();
  shortcuts: ShortcutInput[] = [];
  form: FormGroup = new FormGroup({});

  tabPanelItems = [
    this.translate.instant('vatRegister.purchasesForTaxableSales'),
    this.translate.instant('vatRegister.purchasesForTaxableAndExemptSales')
  ]

  selectedIndex: number = 0;

  proofMarking: string[] = [
    '',
    'MK - faktura wystawiona przez podatnika, który wybrał metodę kasową',
    'VAT_RR - Faktura VAT rr, o której mowa w art. 116 ustawy',
    'WEW - Dokument wewnętrzny'
  ]

  constructor() {
    this.form = this.initForm();
  }

  ngOnInit(): void {}

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
    this.cdr.detectChanges();
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
      sell23Net: [0],
      sell23Vat: [0],
      sell23Gross: [0],
      sell23ZWNet: [0],
      sell23ZWVat: [0],
      sell23ZWGross: [0],
      sell8Net: [0],
      sell8Vat: [0],
      sell8Gross: [0],
      sell8ZWNet: [0],
      sell8ZWVat: [0],
      sell8ZWGross: [0],
      sell5Net: [0],
      sell5Vat: [0],
      sell5Gross: [0],
      sell5ZWNet: [0],
      sell5ZWVat: [0],
      sell5ZWGross: [0],
      rate0: [0],
      isSell: [0],
      isClosed: [0],
      wnt: [0],
      importOutsideUe: [0],
      importServicesUe: [0],
      importServicesOutsideUe: [0],
      deduction50: [0],
      fixedAssets: [0],
      correctFixedAssets: [0],
      MPP: [0],
      purchaseFixedAssets: [0],
      isReverseCharge: [0],
      isThreeSided: [0],
      purchaseMarking: ['']
    });
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

  onChoosedDocumentType(e: any) {
    this.form.controls['documentTypeId'].setValue(e.documentTypeId);
  }

  onChoosedCustomer(e: any) {
    this.form.controls['customerId'].setValue(e.customerId);
  }

  onSave(){
    this.form.markAllAsTouched();

    if (this.form.invalid || this.mode() === 'show') return;

    this.inputDate.instance.focus();
    if (this.mode() === 'add') {
      this.vatRegisterService.postBuy(this.form.value).subscribe({
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
      this.vatRegisterService.putBuy(this.form.value).subscribe({
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
