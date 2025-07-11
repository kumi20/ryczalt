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


/**
 * Company management component for editing company information.
 * 
 * This component provides a popup dialog for managing company details including
 * basic information, tax settings, and office selection. It supports keyboard shortcuts
 * for enhanced user experience and includes comprehensive form validation.
 * 
 * @example
 * ```html
 * <app-company [isVisible]="showCompanyDialog" (onClosing)="onCompanyDialogClose()" (onSaving)="onCompanySaved()"></app-company>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
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
  /**
   * Output event emitter for dialog closing events
   * @type {EventEmitter}
   * @description Emits when the company dialog is closed
   * @since 1.0.0
   */
  @Output() onClosing = new EventEmitter();
  
  /**
   * Output event emitter for saving events
   * @type {EventEmitter}
   * @description Emits when company data is successfully saved
   * @since 1.0.0
   */
  @Output() onSaving = new EventEmitter();
  
  /**
   * Reference to the date input field
   * @type {any}
   * @description Provides access to the date input element for focus management
   * @since 1.0.0
   */
  @ViewChild('inputDate') inputDate: any;

  /**
   * Injected event service for global application events
   * @type {EventService}
   * @description Handles global events, notifications, and utilities
   * @since 1.0.0
   */
  event = inject(EventService);
  
  /**
   * Injected company service for company operations
   * @type {CompanyService}
   * @description Manages company data operations including CRUD operations
   * @since 1.0.0
   */
  companyService = inject(CompanyService);
  
  /**
   * Injected translation service for internationalization
   * @type {TranslateService}
   * @description Provides translation capabilities for component labels
   * @since 1.0.0
   */
  translate = inject(TranslateService);

  /**
   * Translated title for the dialog
   * @type {string}
   * @description Localized title text for the company dialog
   * @since 1.0.0
   */
  title = this.translate.instant('menu.navigationPanelUser.company');
  
  /**
   * Input signal for dialog visibility
   * @type {InputSignal<boolean>}
   * @description Controls the visibility of the company dialog
   * @required
   * @since 1.0.0
   */
  isVisible = input.required<boolean>();

  /**
   * Injected form builder for reactive forms
   * @type {FormBuilder}
   * @description Provides form building capabilities
   * @since 1.0.0
   */
  fb = inject(FormBuilder);
  
  /**
   * Reactive form group for company data
   * @type {FormGroup}
   * @description Contains form controls for company information with validation
   * @since 1.0.0
   */
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

  /**
   * Array of keyboard shortcuts for the component
   * @type {ShortcutInput[]}
   * @description Contains keyboard shortcut configurations for various actions
   * @default []
   * @since 1.0.0
   */
  shortcuts: ShortcutInput[] = [];

  /**
   * Initializes keyboard shortcuts after view initialization.
   * 
   * Sets up keyboard shortcuts for common operations:
   * - Escape: Close the dialog
   * - Ctrl+S: Save the company information
   * 
   * @returns {void}
   * @memberof CompanyComponent
   */
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

  /**
   * Cleanup method called when component is destroyed.
   * 
   * Notifies the event service that the popup is being hidden.
   * 
   * @returns {void}
   * @memberof CompanyComponent
   */
  ngOnDestroy(): void {
    this.event.onHiddenPopUp();
  }

  /**
   * Handles popup initialization.
   * 
   * Registers the escape key handler with the popup component.
   * 
   * @param {any} e - The popup initialization event
   * @returns {void}
   * @memberof CompanyComponent
   */
  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  /**
   * Handles popup visibility changes.
   * 
   * Emits the closing event when popup visibility changes to false.
   * 
   * @param {any} e - The visibility change event
   * @returns {void}
   * @memberof CompanyComponent
   */
  onVisibleChange(e: any) {
    if (!e) {
      this.onClosing.emit(true);
    }
  }

  /**
   * Closes the company dialog.
   * 
   * Emits the closing event to notify parent components.
   * 
   * @returns {void}
   * @memberof CompanyComponent
   */
  closeWindow() {
    this.onClosing.emit(true);
  }

  /**
   * Retrieves company data from the service.
   * 
   * Loads the current company information and populates the form.
   * Shows error notification if the request fails.
   * 
   * @returns {void}
   * @memberof CompanyComponent
   */
  getCompanyData(){
    this.companyService.getCompany().subscribe((res) => {
      console.log(res);

      this.form.patchValue(res);
    }, error=>{
      this.event.httpErrorNotification(error);
    });
  }

  /**
   * Handles tax office selection.
   * 
   * Updates the form with the selected tax office ID when a tax office is chosen.
   * 
   * @param {any} e - The selected tax office data
   * @returns {void}
   * @memberof CompanyComponent
   */
  onChoosed(e: any){
    console.log(e);
    if(e.taxOfficeId){
      this.form.patchValue({
        ID_URZAD_SKARBOWY: e.taxOfficeId
      });
    }
  }

  /**
   * Saves the company information.
   * 
   * Validates the form and submits the company data to the service.
   * Closes the dialog on successful save or shows error notification on failure.
   * 
   * @returns {void}
   * @memberof CompanyComponent
   */
  onSave(){
    if (this.form.invalid) return;

    this.inputDate.instance.focus();

    this.companyService.updateCompany(this.form.value).subscribe(() => {
     this.closeWindow();
    }, error=>{
      this.event.httpErrorNotification(error);
    });
  }

  /**
   * Handles escape key press at the document level.
   * 
   * Provides an alternative way to close the dialog using the escape key.
   * 
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {void}
   * @memberof CompanyComponent
   */
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeWindow();
  }
}
