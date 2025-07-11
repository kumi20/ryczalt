import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { JpkDetailsComponent } from './jpk-details.component';
import { JpkService } from '../../services/jpk.service';
import { JpkDetails } from '../../interface/jpk';

describe('JpkDetailsComponent', () => {
  let component: JpkDetailsComponent;
  let fixture: ComponentFixture<JpkDetailsComponent>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockJpkService: jasmine.SpyObj<JpkService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockJpkDetails: JpkDetails = {
    id: 1,
    submissionId: 'JPK-001',
    jpkType: 'VAT',
    dateFrom: '2024-01-01',
    dateTo: '2024-01-31',
    status: 'SUBMITTED',
    submittedAt: '2024-01-31T10:00:00Z',
    message: 'Successfully submitted',
    statusDescription: 'Submitted successfully',
    documentCount: 150,
    xmlFilePath: '/path/to/jpk-001.xml',
    salesDocuments: [
      {
        documentNumber: 'FV-001',
        customerName: 'Company A',
        customerNip: '1234567890',
        documentDate: '2024-01-15',
        saleDate: '2024-01-15',
        netAmount: 1000.00,
        vatAmount: 230.00
      },
      {
        documentNumber: 'FV-002',
        customerName: 'Company B',
        customerNip: '9876543210',
        documentDate: '2024-01-20',
        saleDate: '2024-01-20',
        netAmount: 2000.00,
        vatAmount: 460.00
      }
    ],
    purchaseDocuments: [
      {
        documentNumber: 'ZK-001',
        customerName: 'Supplier A',
        customerNip: '1111111111',
        documentDate: '2024-01-10',
        netAmount: 500.00,
        vatAmount: 115.00
      }
    ]
  };

  beforeEach(async () => {
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: '1' })
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const jpkServiceSpy = jasmine.createSpyObj('JpkService', ['getJpkDetails']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [
        JpkDetailsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: JpkService, useValue: jpkServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JpkDetailsComponent);
    component = fixture.componentInstance;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockJpkService = TestBed.inject(JpkService) as jasmine.SpyObj<JpkService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    // Setup translate service mock
    mockTranslateService.instant.and.returnValue('Mock Translation');
    
    // Setup JPK service mock
    mockJpkService.getJpkDetails.and.returnValue(of(mockJpkDetails));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.jpkDetails()).toBeNull();
    expect(component.isLoading()).toBe(false);
    expect(component.selectedTabIndex()).toBe(0);
    expect(component.jpkId()).toBeNull();
  });

  it('should load JPK details on ngOnInit', () => {
    spyOn(component, 'loadJpkDetails');
    component.ngOnInit();
    expect(component.loadJpkDetails).toHaveBeenCalledWith(1);
  });

  it('should compute tabs correctly', () => {
    const tabs = component.tabs();
    expect(tabs).toHaveSize(4);
    expect(tabs[0].id).toBe(0);
    expect(tabs[1].id).toBe(1);
    expect(tabs[2].id).toBe(2);
    expect(tabs[3].id).toBe(3);
  });

  it('should compute sales grid options correctly', () => {
    const options = component.salesGridOptions();
    expect(options.height).toBe('calc(100vh - 300px)');
    expect(options.columnHidingEnabled).toBe(true);
    expect(options.columnChooser.enabled).toBe(true);
  });

  it('should compute sales columns correctly', () => {
    const columns = component.salesColumns();
    expect(columns).toHaveSize(7);
    expect(columns[0].dataField).toBe('documentNumber');
    expect(columns[1].dataField).toBe('customerName');
    expect(columns[2].dataField).toBe('customerNip');
    expect(columns[3].dataField).toBe('documentDate');
    expect(columns[4].dataField).toBe('saleDate');
    expect(columns[5].dataField).toBe('netAmount');
    expect(columns[6].dataField).toBe('vatAmount');
  });

  it('should compute purchase columns correctly', () => {
    const columns = component.purchaseColumns();
    expect(columns).toHaveSize(6);
    expect(columns[0].dataField).toBe('documentNumber');
    expect(columns[1].dataField).toBe('customerName');
    expect(columns[2].dataField).toBe('customerNip');
    expect(columns[3].dataField).toBe('documentDate');
    expect(columns[4].dataField).toBe('netAmount');
    expect(columns[5].dataField).toBe('vatAmount');
  });

  it('should load JPK details successfully', () => {
    component.loadJpkDetails(1);
    
    expect(mockJpkService.getJpkDetails).toHaveBeenCalledWith(1);
    expect(component.jpkDetails()).toEqual(mockJpkDetails);
    expect(component.isLoading()).toBe(false);
    expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
  });

  it('should handle error when loading JPK details', () => {
    const errorMessage = 'Failed to load JPK details';
    mockJpkService.getJpkDetails.and.returnValue(throwError(errorMessage));
    spyOn(console, 'error');
    
    component.loadJpkDetails(1);
    
    expect(mockJpkService.getJpkDetails).toHaveBeenCalledWith(1);
    expect(component.isLoading()).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading JPK details:', errorMessage);
    expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
  });

  it('should handle tab selection change', () => {
    const mockEvent = { addedItems: [{ id: 2, text: 'Purchase Documents', icon: 'import' }] };
    
    component.onTabSelectionChanged(mockEvent);
    
    expect(component.selectedTabIndex()).toBe(2);
  });

  it('should navigate back to JPK submissions', () => {
    component.onBack();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/content/jpk-submissions']);
  });

  it('should download XML file when available', () => {
    component.jpkDetails.set(mockJpkDetails);
    spyOn(window, 'open');
    
    component.onDownload();
    
    expect(window.open).toHaveBeenCalledWith('/path/to/jpk-001.xml', '_blank');
  });

  it('should not download when no XML file path', () => {
    const detailsWithoutXml = { ...mockJpkDetails, xmlFilePath: undefined };
    component.jpkDetails.set(detailsWithoutXml);
    spyOn(window, 'open');
    
    component.onDownload();
    
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should not download when no JPK details', () => {
    component.jpkDetails.set(null);
    spyOn(window, 'open');
    
    component.onDownload();
    
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    // Set up a subscription
    const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['subscription'] = mockSubscription;
    
    component.ngOnDestroy();
    
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should handle empty route params', () => {
    mockActivatedRoute.params = of({});
    spyOn(component, 'loadJpkDetails');
    
    component.ngOnInit();
    
    expect(component.loadJpkDetails).not.toHaveBeenCalled();
  });

  it('should handle null route params', () => {
    mockActivatedRoute.params = of({ id: null });
    spyOn(component, 'loadJpkDetails');
    
    component.ngOnInit();
    
    expect(component.loadJpkDetails).not.toHaveBeenCalled();
  });

  it('should handle string route params', () => {
    mockActivatedRoute.params = of({ id: '123' });
    spyOn(component, 'loadJpkDetails');
    
    component.ngOnInit();
    
    expect(component.loadJpkDetails).toHaveBeenCalledWith(123);
  });

  it('should set loading state correctly during data load', () => {
    expect(component.isLoading()).toBe(false);
    
    component.loadJpkDetails(1);
    
    // Loading should be set to true initially, then false after completion
    expect(component.isLoading()).toBe(false); // After observable completes
  });
});
