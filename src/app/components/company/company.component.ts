import {
  Component,
  EventEmitter,
  inject,
  input,
  AfterViewInit,
  OnDestroy,
  Output,
  ViewChild,
  HostListener,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxPopupModule,
  DxScrollViewModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { EventService } from '../../services/event-services.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../services/company.services';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AllowIn, ShortcutInput, ShortcutEventOutput } from 'ng-keyboard-shortcuts';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { OfficeComponent } from '../office/office.component';


@Component({
  selector: 'app-company',
  imports: [
    DxPopupModule,
    DxButtonModule,
    DxScrollViewModule,
    TranslateModule,
    DxTooltipModule,
    ReactiveFormsModule,
    DxTextAreaModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    CommonModule,
    NgShortcutsComponent,
    OfficeComponent
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
})
export class CompanyComponent implements AfterViewInit, OnDestroy{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();
  @ViewChild('inputDate') inputDate: any;

  event = inject(EventService);
  companyService = inject(CompanyService);
  translate = inject(TranslateService);

  title = this.translate.instant('menu.navigationPanelUser.company');
  isVisible = input.required<boolean>();

  fb = inject(FormBuilder);
  form = this.fb.group({
    id: [null, Validators.required],
    name: [null, Validators.required],
    nip: [null, Validators.required],
    address: [null, Validators.required],
    city: [null, Validators.required],
    postal_code: [null, Validators.required],
    phone: [null],
    email: [null],
    is_active: [true],
    isVatPayer: [false],
    isFPPayer: [false],
    isHealthInsurance: [false],
    isSocialInsurance: [false],
    isSicknessInsurance: [false],
    ID_URZAD_SKARBOWY:[null],
    licenseNumber: [null],
    dataEnd: [null],
  })

  shortcuts: ShortcutInput[] = [];

  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: 'escape',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (e: ShortcutEventOutput) => {
          this.onClosing.emit(true);
        },
      },
      {
        key: 'ctrl + s',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (e: ShortcutEventOutput) => {
          this.onSave();
        },
      },
    ];
  }

  ngOnDestroy(): void {
    this.event.onHiddenPopUp();
  }

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  onVisibleChange(e: any) {
    if (!e) {
      this.onClosing.emit(true);
    }
  }

  closeWindow() {
    this.onClosing.emit(true);
  }

  getCompanyData(){
    this.companyService.getCompany().subscribe((res) => {
      console.log(res);

      this.form.patchValue(res);
    }, error=>{
      this.event.httpErrorNotification(error);
    });
  }

  onChoosed(e: any){
    console.log(e);
    if(e.taxOfficeId){
      this.form.patchValue({
        ID_URZAD_SKARBOWY: e.taxOfficeId
      });
    }
  }

  onSave(){
    if (this.form.invalid) return;

    this.inputDate.instance.focus();

    this.companyService.updateCompany(this.form.value).subscribe(() => {
     this.closeWindow();
    }, error=>{
      this.event.httpErrorNotification(error);
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeWindow();
  }
}
