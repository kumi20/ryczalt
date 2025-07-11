import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { JpkSubmissionsComponent } from './jpk-submissions.component';
import { AppServices } from '../../services/app-services.service';
import { JpkService } from '../../services/jpk.service';
import { EventService } from '../../services/event-services.service';

describe('JpkSubmissionsComponent', () => {
  let component: JpkSubmissionsComponent;
  let fixture: ComponentFixture<JpkSubmissionsComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAppServices: jasmine.SpyObj<AppServices>;
  let mockJpkService: jasmine.SpyObj<JpkService>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockJpkSubmissions = [
    {
      id: 1,
      submissionId: 'JPK-001',
      jpkType: 'VAT',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      status: 'SUBMITTED',
      submittedAt: '2024-01-31T10:00:00Z',
      message: 'Successfully submitted',
      statusDescription: 'Submitted successfully',
      documentCount: 150
    },
    {
      id: 2,
      submissionId: 'JPK-002',
      jpkType: 'CIT',
      dateFrom: '2024-02-01',
      dateTo: '2024-02-28',
      status: 'PROCESSING',
      submittedAt: '2024-02-28T15:30:00Z',
      message: 'Processing in progress',
      statusDescription: 'Currently processing',
      documentCount: 200
    }
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const appServicesSpy = jasmine.createSpyObj('AppServices', ['getData']);
    const jpkServiceSpy = jasmine.createSpyObj('JpkService', ['getJpkSubmissions']);
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['onBeforeSendDataSource', 'onAjaxDataSourceError']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      imports: [
        JpkSubmissionsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AppServices, useValue: appServicesSpy },
        { provide: JpkService, useValue: jpkServiceSpy },
        { provide: EventService, useValue: eventServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JpkSubmissionsComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAppServices = TestBed.inject(AppServices) as jasmine.SpyObj<AppServices>;
    mockJpkService = TestBed.inject(JpkService) as jasmine.SpyObj<JpkService>;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup translate service mock
    mockTranslateService.instant.and.returnValue('Mock Translation');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedRows).toEqual([]);
    expect(component.focusedRowIndex).toBe(0);
    expect(component.orderBy()).toBe('submissionDate');
    expect(component.order()).toBe('DESC');
    expect(component.currentYear()).toBe(new Date().getFullYear());
    expect(component.focusedElement()).toBeNull();
  });

  it('should generate years array correctly', () => {
    const currentYear = new Date().getFullYear();
    expect(component.years).toHaveSize(5);
    expect(component.years[0].value).toBe(currentYear.toString());
    expect(component.years[4].value).toBe((currentYear - 4).toString());
  });

  it('should call getData on ngOnInit', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should setup shortcuts in ngAfterViewInit', () => {
    component.ngAfterViewInit();
    expect(component.shortcuts).toHaveSize(1);
    expect(component.shortcuts[0].key).toBe('F2');
  });

  it('should generate load params correctly', () => {
    component.currentYear.set(2023);
    component.orderBy.set('submissionDate');
    component.order.set('ASC');

    const params = component.getLoadParams();
    expect(params.year).toBe(2023);
    expect(params.orderBy).toBe('submissionDate');
    expect(params.order).toBe('ASC');
  });

  it('should handle year change correctly', () => {
    spyOn(component, 'getData');
    const mockEvent = { selectedItem: { value: '2023', label: '2023' } };
    
    component.onYearChanged(mockEvent);
    
    expect(component.currentYear()).toBe(2023);
    expect(component.getData).toHaveBeenCalled();
  });

  it('should handle focused row change', () => {
    const mockEvent = { row: { data: mockJpkSubmissions[0] } };
    
    component.onFocusedRowChanged(mockEvent);
    
    expect(component.focusedElement()).toEqual(mockJpkSubmissions[0]);
  });

  it('should navigate to details when onShow is called with valid element', () => {
    spyOn(component, 'getFocusedElement').and.returnValue(mockJpkSubmissions[0]);
    
    component.onShow();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/content/jpk-details', 1]);
  });

  it('should not navigate when onShow is called with invalid element', () => {
    spyOn(component, 'getFocusedElement').and.returnValue(null);
    spyOn(console, 'error');
    
    component.onShow();
    
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle row double click', () => {
    spyOn(component, 'onShow');
    const mockEvent = { data: mockJpkSubmissions[0] };
    
    component.onRowDblClick(mockEvent);
    
    expect(component.onShow).toHaveBeenCalled();
  });

  it('should handle column header click', () => {
    const fieldName = 'submissionDate';
    
    component.onColumnHeaderClick(fieldName);
    
    expect(component.orderBy()).toBe(fieldName);
  });

  it('should handle order change', () => {
    spyOn(component, 'getData');
    const order = 'ASC';
    
    component.onOrderClick(order);
    
    expect(component.order()).toBe(order);
    expect(component.getData).toHaveBeenCalled();
  });

  it('should refresh data on onRefresh', () => {
    spyOn(component, 'getData');
    
    component.onRefresh();
    
    expect(component.getData).toHaveBeenCalled();
  });

  it('should compute options correctly', () => {
    const options = component.options();
    expect(options.height).toBe('calc(100vh - 150px)');
    expect(options.columnHidingEnabled).toBe(true);
    expect(options.columnChooser.enabled).toBe(true);
  });

  it('should compute columns correctly', () => {
    const columns = component.columns();
    expect(columns).toHaveSize(9);
    expect(columns[0].dataField).toBe('submissionId');
    expect(columns[1].dataField).toBe('jpkType');
    expect(columns[2].dataField).toBe('dateFrom');
    expect(columns[3].dataField).toBe('dateTo');
    expect(columns[4].dataField).toBe('status');
    expect(columns[5].dataField).toBe('submittedAt');
    expect(columns[6].dataField).toBe('message');
    expect(columns[7].dataField).toBe('statusDescription');
    expect(columns[8].dataField).toBe('documentCount');
  });

  it('should handle empty focused element', () => {
    spyOn(component, 'getFocusedElement').and.returnValue(undefined);
    
    component.onShow();
    
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle element without id', () => {
    spyOn(component, 'getFocusedElement').and.returnValue({ submissionId: 'JPK-001' });
    spyOn(console, 'error');
    
    component.onShow();
    
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle focused row change with null row', () => {
    const mockEvent = { row: null };
    
    component.onFocusedRowChanged(mockEvent);
    
    expect(component.focusedElement()).toBeNull();
  });

  it('should handle focused row change with undefined row data', () => {
    const mockEvent = { row: { data: undefined } };
    
    component.onFocusedRowChanged(mockEvent);
    
    expect(component.focusedElement()).toBeUndefined();
  });
});
