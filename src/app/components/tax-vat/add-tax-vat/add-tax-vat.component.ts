import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  Output,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import {
  DxButtonModule,
  DxDateBoxModule,
  DxPopupModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTooltipModule,
  DxCheckBoxModule,
  DxNumberBoxModule,
} from 'devextreme-angular';
import { EventService } from '../../../services/event-services.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { TaxVatService } from '../../../services/tax-vat.services';
import { TaxVat } from '../../../interface/tax-vat';

@Component({
  selector: 'app-add-tax-vat',
  imports: [
    DxNumberBoxModule,
    DxPopupModule,
    DxButtonModule,
    DxTooltipModule,
    DxScrollViewModule,
    TranslateModule,
    NgShortcutsComponent,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxCheckBoxModule,
  ],
  templateUrl: './add-tax-vat.component.html',
  styleUrl: './add-tax-vat.component.scss',
})
export class AddTaxVatComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('firstSelect') firstSelect: any;
  @Input() taxVat: TaxVat | null = null;

  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();

  translate = inject(TranslateService);
  title = this.translate.instant('toolbar.adding');
  event = inject(EventService);
  shortcuts: ShortcutInput[] = [];
  fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    ID_PODATEK_VAT: [null],
    MIESIAC: [this.event.globalDate.month, Validators.required],
    ROK: [this.event.globalDate.year, Validators.required],
    DATA_WPLATY: [null],
    ZAPLACONY: [false],
    NADWYZKA: [0],
    KWOTA: [0],
  });
  submitted: boolean = false;
  taxVatService = inject(TaxVatService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taxVat']) {
      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        if(this.taxVat) this.form.patchValue(this.taxVat);
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

  getPaymentDeadline(): Date {
    let nextMonth = this.form.value.MIESIAC + 1;
    let deadlineYear = this.form.value.ROK;

    if (nextMonth > 12) {
      nextMonth = 1;
      deadlineYear++;
    }

    const dateOfReceipt = new Date(deadlineYear, nextMonth - 1, 25);

    this.form.patchValue({
      DATA_WPLATY: dateOfReceipt,
    });

    return new Date(deadlineYear, nextMonth - 1, 25);
  }

  initForm(){
    this.getPaymentDeadline();
    this.taxVatService.calculate(this.form.value.ROK, this.form.value.MIESIAC).subscribe((res) => {
      this.form.patchValue({
        KWOTA: res.kwotaDoZaplaty,
        NADWYZKA: res.nowaNadwyzka,
      });
    }, (err) => {
      this.event.httpErrorNotification(err);
    });
  }

  onVisibleChange(e: any) {
    if (!e) {
      this.onClosing.emit(true);
    }
  }

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  closeWindow() {
    this.onClosing.emit(true);
  }

  onSave() {
    this.submitted = true;
    this.form.markAllAsTouched();

   if(this.form.invalid) return;

   if(this.mode() === 'add'){
    this.taxVatService.post(this.form.value).subscribe((res) => {
      this.onSaving.emit(res);
    }, (err) => {
      this.event.httpErrorNotification(err);
    });
    return;
   }

   this.taxVatService.put(this.form.value).subscribe((res) => {
    this.onSaving.emit(res);
   }, (err) => {
    this.event.httpErrorNotification(err);
   });
  }
}
