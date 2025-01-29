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

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flatRateTax']) {
      if(this.mode() === 'add'){
        this.flatRateTaxService.calculate(this.form.value.month as number, this.form.value.year as number).subscribe(
         {
            next: (data) => {
              this.form.patchValue({
                baseTax: data.baseTax,
                amountFlatRateTax: data.amountFlatRateTax,
                reduceTaxNextMonth: data.reduceTaxNextMonth,
                income: data.income,
                socialInsurance: data.socialInsurance,
                reductionAmountHealt: data.reductionAmountHealt
              })
            console.log(data)
            },
            error: (err) => {
              this.event.httpErrorNotification(err);
            },
          }
        )
      }

      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        if(this.flatRateTax) this.form.patchValue(this.flatRateTax as any);
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

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  initForm() {
    console.log('initForm');
  }

  onSave() {
    if (this.form.invalid) return;

    if (this.mode() === 'add') {
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
}
