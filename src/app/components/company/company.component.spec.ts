import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { CompanyComponent } from './company.component';
import { EventService } from '../../services/event-services.service';
import { CompanyService } from '../../services/company.services';

describe('CompanyComponent', () => {
  let component: CompanyComponent;
  let fixture: ComponentFixture<CompanyComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockCompanyService: jasmine.SpyObj<CompanyService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockCompanyData = {
    id: 1,
    name: 'Test Company',
    nip: '1234567890',
    address: 'Test Address',
    city: 'Test City',
    postal_code: '12-345',
    phone: '123456789',
    email: 'test@company.com',
    is_active: true,
    isVatPayer: true,
    isFPPayer: false,
    isHealthInsurance: true,
    isSocialInsurance: true,
    isSicknessInsurance: false,
    ID_URZAD_SKARBOWY: 1,
    licenseNumber: 'LICENSE123',
    dataEnd: '2024-12-31'
  };

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['httpErrorNotification', 'onHiddenPopUp']);
    const companyServiceSpy = jasmine.createSpyObj('CompanyService', ['getCompany', 'updateCompany']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      imports: [
        CompanyComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: EventService, useValue: eventServiceSpy },
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyComponent);
    component = fixture.componentInstance;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockCompanyService = TestBed.inject(CompanyService) as jasmine.SpyObj<CompanyService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Set up default mocks
    mockTranslateService.instant.and.returnValue('Mock Translation');
    mockCompanyService.getCompany.and.returnValue(of(mockCompanyData));
    mockCompanyService.updateCompany.and.returnValue(of(mockCompanyData));

    // Set input signal
    component.isVisible = signal(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.get('id')?.value).toBeNull();
    expect(component.form.get('name')?.value).toBeNull();
    expect(component.form.get('nip')?.value).toBeNull();
    expect(component.form.get('address')?.value).toBeNull();
    expect(component.form.get('city')?.value).toBeNull();
    expect(component.form.get('postal_code')?.value).toBeNull();
    expect(component.form.get('phone')?.value).toBeNull();
    expect(component.form.get('email')?.value).toBeNull();
    expect(component.form.get('is_active')?.value).toBe(true);
    expect(component.form.get('isVatPayer')?.value).toBe(false);
    expect(component.form.get('isFPPayer')?.value).toBe(false);
    expect(component.form.get('isHealthInsurance')?.value).toBe(false);
    expect(component.form.get('isSocialInsurance')?.value).toBe(false);
    expect(component.form.get('isSicknessInsurance')?.value).toBe(false);
    expect(component.form.get('ID_URZAD_SKARBOWY')?.value).toBeNull();
    expect(component.form.get('licenseNumber')?.value).toBeNull();
    expect(component.form.get('dataEnd')?.value).toBeNull();
  });

  it('should have required validators on required fields', () => {
    const requiredFields = ['id', 'name', 'nip', 'address', 'city', 'postal_code'];
    
    requiredFields.forEach(field => {
      const control = component.form.get(field);
      expect(control?.hasError('required')).toBe(true);
    });
  });

  it('should setup keyboard shortcuts in ngAfterViewInit', () => {
    component.ngAfterViewInit();
    
    expect(component.shortcuts).toHaveSize(2);
    expect(component.shortcuts[0].key).toBe('escape');
    expect(component.shortcuts[1].key).toBe('ctrl + s');
  });

  it('should emit onClosing when escape shortcut is triggered', () => {
    spyOn(component.onClosing, 'emit');
    component.ngAfterViewInit();
    
    // Simulate escape key shortcut
    const escapeShortcut = component.shortcuts.find(s => s.key === 'escape');
    escapeShortcut?.command?.({} as any);
    
    expect(component.onClosing.emit).toHaveBeenCalledWith(true);
  });

  it('should call onSave when ctrl+s shortcut is triggered', () => {
    spyOn(component, 'onSave');
    component.ngAfterViewInit();
    
    // Simulate ctrl+s shortcut
    const saveShortcut = component.shortcuts.find(s => s.key === 'ctrl + s');
    saveShortcut?.command?.({} as any);
    
    expect(component.onSave).toHaveBeenCalled();
  });

  it('should emit onClosing when visibility changes to false', () => {
    spyOn(component.onClosing, 'emit');
    
    component.onVisibleChange(false);
    
    expect(component.onClosing.emit).toHaveBeenCalledWith(true);
  });

  it('should not emit onClosing when visibility changes to true', () => {
    spyOn(component.onClosing, 'emit');
    
    component.onVisibleChange(true);
    
    expect(component.onClosing.emit).not.toHaveBeenCalled();
  });

  it('should emit onClosing when closeWindow is called', () => {
    spyOn(component.onClosing, 'emit');
    
    component.closeWindow();
    
    expect(component.onClosing.emit).toHaveBeenCalledWith(true);
  });

  it('should load company data successfully', () => {
    component.getCompanyData();
    
    expect(mockCompanyService.getCompany).toHaveBeenCalled();
    expect(component.form.get('id')?.value).toBe(mockCompanyData.id);
    expect(component.form.get('name')?.value).toBe(mockCompanyData.name);
    expect(component.form.get('nip')?.value).toBe(mockCompanyData.nip);
    expect(component.form.get('address')?.value).toBe(mockCompanyData.address);
    expect(component.form.get('city')?.value).toBe(mockCompanyData.city);
    expect(component.form.get('postal_code')?.value).toBe(mockCompanyData.postal_code);
  });

  it('should handle error when loading company data', () => {
    const errorMessage = 'Failed to load company data';
    mockCompanyService.getCompany.and.returnValue(throwError(errorMessage));
    
    component.getCompanyData();
    
    expect(mockCompanyService.getCompany).toHaveBeenCalled();
    expect(mockEventService.httpErrorNotification).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle tax office selection', () => {
    const taxOfficeData = { taxOfficeId: 123 };
    
    component.onChoosed(taxOfficeData);
    
    expect(component.form.get('ID_URZAD_SKARBOWY')?.value).toBe(123);
  });

  it('should not update form when no taxOfficeId in selection', () => {
    const taxOfficeData = { someOtherField: 'value' };
    
    component.onChoosed(taxOfficeData);
    
    expect(component.form.get('ID_URZAD_SKARBOWY')?.value).toBeNull();
  });

  it('should save company data successfully', () => {
    // Fill form with valid data
    component.form.patchValue(mockCompanyData);
    spyOn(component, 'closeWindow');
    
    component.onSave();
    
    expect(mockCompanyService.updateCompany).toHaveBeenCalledWith(mockCompanyData);
    expect(component.closeWindow).toHaveBeenCalled();
  });

  it('should not save when form is invalid', () => {
    // Leave form with invalid data (required fields empty)
    component.onSave();
    
    expect(mockCompanyService.updateCompany).not.toHaveBeenCalled();
  });

  it('should handle error when saving company data', () => {
    const errorMessage = 'Failed to save company data';
    mockCompanyService.updateCompany.and.returnValue(throwError(errorMessage));
    component.form.patchValue(mockCompanyData);
    
    component.onSave();
    
    expect(mockCompanyService.updateCompany).toHaveBeenCalled();
    expect(mockEventService.httpErrorNotification).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle escape key press', () => {
    spyOn(component, 'closeWindow');
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    
    component.handleEscapeKey(keyboardEvent);
    
    expect(component.closeWindow).toHaveBeenCalled();
  });

  it('should call onHiddenPopUp on destroy', () => {
    component.ngOnDestroy();
    
    expect(mockEventService.onHiddenPopUp).toHaveBeenCalled();
  });

  it('should register escape key handler on popup init', () => {
    const mockComponent = { registerKeyHandler: jasmine.createSpy() };
    const mockEvent = { component: mockComponent };
    
    component.onInit(mockEvent);
    
    expect(mockComponent.registerKeyHandler).toHaveBeenCalledWith('escape', jasmine.any(Function));
  });

  it('should validate required fields correctly', () => {
    const requiredFields = ['id', 'name', 'nip', 'address', 'city', 'postal_code'];
    
    // Test each required field
    requiredFields.forEach(field => {
      component.form.get(field)?.setValue('');
      expect(component.form.get(field)?.invalid).toBe(true);
      expect(component.form.get(field)?.hasError('required')).toBe(true);
      
      component.form.get(field)?.setValue('valid value');
      expect(component.form.get(field)?.invalid).toBe(false);
    });
  });

  it('should handle form patching with partial data', () => {
    const partialData = {
      name: 'Partial Company',
      nip: '9876543210'
    };
    
    component.form.patchValue(partialData);
    
    expect(component.form.get('name')?.value).toBe('Partial Company');
    expect(component.form.get('nip')?.value).toBe('9876543210');
    expect(component.form.get('address')?.value).toBeNull();
  });
});
