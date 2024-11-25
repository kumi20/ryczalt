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
  DxPopupModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxTooltipModule,
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
import { CustomerService } from '../../../services/customer.service';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { Customer } from '../../../interface/customers';
import { CountryComponent } from '../../country/country.component';
import { Country } from '../../../interface/country';
import { Verify } from 'crypto';

@Component({
  selector: 'app-new-customer',
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
    CountryComponent,
  ],
  templateUrl: './new-customer.component.html',
  styleUrl: './new-customer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewCustomerComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('inputCustomerVat') inputCustomerVat: any;
  @ViewChild('countryBox') countryBox: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  fb = inject(FormBuilder);
  customerService = inject(CustomerService);

  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();
  customer = input<any>();

  title = this.translate.instant('toolbar.adding');
  form: FormGroup = new FormGroup({});
  isValidVatNumber = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];

  constructor() {
    this.form = this.initForm();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer']) {
      if (this.mode() === 'edit') {
        console.log(this.customer());
        this.title = this.translate.instant('toolbar.editing');
        this.form.patchValue(this.customer());
        this.isValidVatNumber.set(
          this.checkValidVatNumber(this.customer().customerVat)
        );
      }

      if (this.mode() === 'show') {
        this.title = this.translate.instant('toolbar.showing');
        this.form.patchValue(this.customer);
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

  setPLId(e: number){
    if(this.mode() === 'edit' || this.mode() === 'show') return;
    this.form.controls['countryId'].setValue(e);
  }
  initForm(): FormGroup {
    return this.fb.group({
      customerId: [null],
      customerName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      street: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      postalCode: ['', [Validators.required]],
      countryId: [null, [Validators.required, Validators.maxLength(50)]],
      customerVat: ['', [Validators.required]],
      accountNumber: ['', []],

      // Zagnieżdżony FormGroup dla addressDetails
      addressDetails: this.fb.group({
        name: [''],
        street: [''],
        city: [''],
        postalCode: [''],
        countryId: [null],
      }),

      // Zagnieżdżony FormGroup dla contactDetails
      contactDetails: this.fb.group({
        contactPerson: [''],
        email: [''],
        phone: [''],
        website: [''],
        fax: [''],
      }),

      isSupplier: [0],
      isRecipient: [0],
      isOffice: [0],
    });
  }

  getCustomerData() {
    if (!this.checkValidVatNumber(this.form.controls['customerVat'].value)) {
      this.event.showNotification(
        'warning',
        this.translate.instant('customers.incorectVatNumber')
      );
      return;
    }

    this.customerService
      .getCustomerByVat(this.form.controls['customerVat'].value)
      .subscribe(
        (data) => {
          this.form.patchValue(data);

          const index = this.countryBox.countryList().find((country: Country)=> country.name === data.country);
          if(index){
            this.form.controls['countryId'].setValue(index.countryId);
          }
        },
        (err) => {
          this.event.showNotification('error', err);
        }
      );
  }

  removeLettersFromNIP(nip: string): string {
    // Usuwamy wszystkie litery z ciągu za pomocą wyrażenia regularnego
    return nip.replace(/[a-zA-Z]/g, '');
  }

  checkValidVatNumber(VatNumber: string): boolean {
    const countryValue = this.form.get('countryId')?.value;

    if (
      countryValue === 21 ||
      countryValue === null
    ) {
      return this.event.isValidNip(this.removeLettersFromNIP(VatNumber));
    } else {
      return true;
    }
  }

  isValidNip(nip: string): boolean {
    if (typeof nip !== 'string') {
      return false;
    }

    nip = nip.replace(/[\ \-]/gi, '');

    let weight = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    let controlNumber = parseInt(nip.substring(9, 10));
    let weightCount = weight.length;
    for (let i = 0; i < weightCount; i++) {
      sum += parseInt(nip.substr(i, 1)) * weight[i];
    }
    return sum % 11 === controlNumber;
  }

  parseToInt() {
    this.form.controls['isSupplier'].setValue(
      this.form.value.isSupplier ? 1 : 0
    );
    this.form.controls['isRecipient'].setValue(
      this.form.value.isRecipient ? 1 : 0
    );
    this.form.controls['isOffice'].setValue(this.form.value.isOffice ? 1 : 0);
  }

  onSave() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;
    this.parseToInt();
    if (this.mode() === 'add') {
      this.customerService.postCustomer(this.form.value).subscribe({
        next: (data) => {
          this.onSaving.emit(data);
        },
        error: (err) => {
          this.event.httpErrorNotification(err);
        },
      });
      return;
    }

    if (this.mode() === 'edit') {
      this.customerService.putCustomer(this.form.value).subscribe({
        next: (data) => {
          this.onSaving.emit(data);
        },
        error: (err) => {
          this.event.httpErrorNotification(err);
        },
      });
      return;
    }

    if (this.mode() === 'show') {
      this.onClosing.emit(true);
      return;
    }
  }

  onCountryChanged() {
    this.isValidVatNumber.set(
      this.checkValidVatNumber(this.form.value.customerVat)
    );
  }

  onChoosedCountry(e: Country, controler: string) {
    if(e){
      if (controler === 'countryId') {
        this.form.controls[controler].setValue(e.countryId);
        return;
      }

      this.form.controls['addressDetails'].get('countryId')?.setValue(e.countryId);
      console.log(this.form.value)
    }
  }
}
