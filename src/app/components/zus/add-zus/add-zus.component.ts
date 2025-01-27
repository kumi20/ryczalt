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
  DxNumberBoxModule
} from 'devextreme-angular';
import { EventService } from '../../../services/event-services.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { NgShortcutsComponent } from '../../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ZusService } from '../../../services/zus.service';
import { ContributionsZUS } from '../../../interface/zus';

@Component({
  selector: 'app-add-zus',
  imports: [
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
    DxNumberBoxModule
  ],
  templateUrl: './add-zus.component.html',
  styleUrl: './add-zus.component.scss',
})
export class AddZusComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('firstSelect') firstSelect: any;
  @Input() zus: ContributionsZUS | null = null;

  isVisible = input.required<boolean>();
  mode = input.required<'add' | 'edit' | 'show'>();

  translate = inject(TranslateService);
  title = this.translate.instant('toolbar.adding');
  event = inject(EventService);
  shortcuts: ShortcutInput[] = [];
  fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    contributionsZUSId: [0],
    month: [this.event.globalDate.month, Validators.required],
    year: [this.event.globalDate.year, Validators.required],
    isContributionHolidays: [false],
    social: [0, Validators.required],
    isSocialPaid: [false],
    dateSocialPaid: [null],
    contributionHealth: [0, Validators.required],
    isHealthPaid: [false],
    dateHealthPaid: [null],
    fpfgsw: [0, Validators.required],
    isFpfgswPaid: [false],
    dateFpfgswPaid: [null],
    fp: [0, Validators.required],
    isFpPaid: [false],
    dateFpPaid: [null],
  });

  dateOfReceipt: Date = new Date();
  incomeToBasis: number = 0;
  incomeToBasisHealth: number = 0;

  zusService = inject(ZusService);
  submitted: boolean = false;
  cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit(): void {
    this.getPaymentDeadline();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['zus']) {
      if (this.mode() === 'edit') {
        this.title = this.translate.instant('toolbar.editing');
        if(this.zus) this.form.patchValue(this.zus);
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
    let nextMonth = this.form.value.month + 1;
    let deadlineYear = this.form.value.year;

    if (nextMonth > 12) {
      nextMonth = 1;
      deadlineYear++;
    }

    this.dateOfReceipt = new Date(deadlineYear, nextMonth - 1, 20);

    this.form.patchValue({
      dateSocialPaid: this.dateOfReceipt,
      dateHealthPaid: this.dateOfReceipt,
      dateFpfgswPaid: this.dateOfReceipt,
      dateFpPaid: this.dateOfReceipt
    });

    return new Date(deadlineYear, nextMonth - 1, 20);
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

  onSave() {
    this.submitted = true;
    this.form.markAllAsTouched();

   if(this.form.invalid) return;

   if(this.mode() === 'add'){
    this.zusService.post(this.form.value).subscribe((res) => {
      this.onSaving.emit(res);
    }, (err) => {
      this.event.httpErrorNotification(err);
    });
    return;
   }

   this.zusService.put(this.form.value).subscribe((res) => {
    this.onSaving.emit(res);
   }, (err) => {
    this.event.httpErrorNotification(err);
   });
  }

  initForm(){
    this.firstSelect.instance.focus();
    this.zusService.getZus(this.form.value.month, this.form.value.year).subscribe((res) => {
      this.getPaymentDeadline();
      if(res.data.length > 0){
        this.incomeToBasis = Number(res.data[0].base);
        this.incomeToBasisHealth = Number(res.data[0].totalIncome) - Number(res.data[0].previousMonthSocial);
        if(this.mode() === 'add'){
          this.form.patchValue({
            social: Number(res.data[0].social),
            fpfgsw: Number(res.data[0].FGSP)
          });

        }

        //dla roku 2024 skadki zdrowotne
        if(Number(res.data[0].totalIncome) < 60000 && this.form.value.year === 2024){
          this.form.patchValue({
            contributionHealth: 419.46
          });
        }

        else if(Number(res.data[0].totalIncome) >= 60000 && Number(res.data[0].totalIncome) < 300000 && this.form.value.year === 2024){
          this.form.patchValue({
            contributionHealth: 699.11
          });
        }

        else if(Number(res.data[0].totalIncome) >= 300000 && this.form.value.year === 2024){
          this.form.patchValue({
            contributionHealth: 1258.39
          });
        }


        //dla roku 2025 skadki zdrowotne
        if(Number(res.data[0].totalIncome) < 60000 && this.form.value.year === 2025){
          this.form.patchValue({
            contributionHealth: 461.66
          });
        }

        else if(Number(res.data[0].totalIncome) >= 60000 && Number(res.data[0].totalIncome) < 300000 && this.form.value.year === 2025){
          this.form.patchValue({
            contributionHealth: 769.43
          });
        }

        else if(Number(res.data[0].totalIncome) >= 300000 && this.form.value.year === 2025){
          this.form.patchValue({
            contributionHealth: 1384.97
          });
        }
      }
    }, (err) => {
      this.event.httpErrorNotification(err);
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeWindow();
  }
}
