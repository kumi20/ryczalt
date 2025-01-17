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
      sell23net: [0],
      sell23vat: [0],
      sell23gross: [0],
      sell23ZWnet: [0],
      sell23ZWvat: [0],
      sell23ZWgross: [0],
      sell8net: [0],
      sell8vat: [0],
      sell8gross: [0],
      sell8ZWnet: [0],
      sell8ZWvat: [0],
      sell8ZWgross: [0],
      sell5net: [0],
      sell5vat: [0],
      sell5gross: [0],
      sell5ZWnet: [0],
      sell5ZWvat: [0],
      sell5ZWgross: [0],
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

  parseToInt() {
    console.log(this.form.value);

    this.form.controls['wnt'].setValue(
      this.form.value.wnt ? 1 : 0
    );

    this.form.controls['importOutsideUe'].setValue(
      this.form.value.importOutsideUe ? 1 : 0
    );

    this.form.controls['importServicesUe'].setValue(
      this.form.value.importServicesUe ? 1 : 0
    );

    this.form.controls['importServicesOutsideUe'].setValue(
      this.form.value.importServicesOutsideUe ? 1 : 0
    );

    this.form.controls['isThreeSided'].setValue(
      this.form.value.isThreeSided ? 1 : 0
    );

    this.form.controls['deduction50'].setValue(
      this.form.value.deduction50 ? 1 : 0
    );

    this.form.controls['fixedAssets'].setValue(
      this.form.value.fixedAssets ? 1 : 0
    );

    this.form.controls['correctFixedAssets'].setValue(
      this.form.value.correctFixedAssets ? 1 : 0
    );

    this.form.controls['MPP'].setValue(
      this.form.value.MPP ? 1 : 0
    );

    this.form.controls['isReverseCharge'].setValue(
      this.form.value.isReverseCharge ? 1 : 0
    );

    this.form.controls['purchaseFixedAssets'].setValue(
      this.form.value.purchaseFixedAssets ? 1 : 0
    );
  }

  onSave(){
    this.form.markAllAsTouched();

    if (this.form.invalid || this.mode() === 'show') return;

    this.parseToInt();

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
}
