import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InternalEvidenceComponent } from './internal-evidence.component';
import { InternalEvidenceService } from '../../services/internal-evidence.service';
import { EventService } from '../../services/event-services.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('InternalEvidenceComponent', () => {
  let component: InternalEvidenceComponent;
  let fixture: ComponentFixture<InternalEvidenceComponent>;
  let internalEvidenceService: jasmine.SpyObj<InternalEvidenceService>;
  let eventService: jasmine.SpyObj<EventService>;

  const mockInternalEvidence = {
    internalEvidenceId: 1,
    isCoast: true,
    documentNumber: 'DOC/2024/001',
    documentDate: '2024-03-20',
    description: 'Test description',
    amount: 100,
    price: 50.00,
    unit: 'szt',
    personIssuing: 'John Doe',
    taxVat: '23%',
    remarks: 'Test remarks',
    companyId: 1,
    userInsert: 1,
    dateInsert: '2024-03-20',
    userUpdate: null,
    dateUpdate: null
  };

  beforeEach(async () => {
    const internalEvidenceServiceSpy = jasmine.createSpyObj('InternalEvidenceService', [
      'post',
      'put',
      'delete',
      'getById'
    ]);
    const eventServiceSpy = jasmine.createSpyObj('EventService', [
      'httpErrorNotification',
      'setFocus'
    ]);

    await TestBed.configureTestingModule({
      imports: [InternalEvidenceComponent],
      providers: [
        { provide: InternalEvidenceService, useValue: internalEvidenceServiceSpy },
        { provide: EventService, useValue: eventServiceSpy }
      ]
    }).compileComponents();

    internalEvidenceService = TestBed.inject(InternalEvidenceService) as jasmine.SpyObj<InternalEvidenceService>;
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    
    fixture = TestBed.createComponent(InternalEvidenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('CRUD Operations', () => {
    it('should add new internal evidence', (done) => {
      internalEvidenceService.post.and.returnValue(of(mockInternalEvidence));
      
      // Symuluj dodawanie nowego rekordu
      component.addNewRecord();
      component.onSaving(mockInternalEvidence);

      expect(internalEvidenceService.post).toHaveBeenCalled();
      expect(component.isAdd()).toBeFalsy();
      done();
    });

    it('should handle add error', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'test error',
        status: 400,
        statusText: 'Bad Request'
      });

      internalEvidenceService.post.and.returnValue(throwError(() => errorResponse));
      
      component.addNewRecord();
      component.onSaving(mockInternalEvidence);

      expect(eventService.httpErrorNotification).toHaveBeenCalled();
      done();
    });

    it('should edit internal evidence', (done) => {
      internalEvidenceService.put.and.returnValue(of(mockInternalEvidence));
      
      component.onEdit();
      component.onSaving(mockInternalEvidence);

      expect(internalEvidenceService.put).toHaveBeenCalled();
      expect(component.isAdd()).toBeFalsy();
      done();
    });

    it('should delete internal evidence', (done) => {
      internalEvidenceService.delete.and.returnValue(of(void 0));
      
      // Ustaw zmokowany element jako aktualnie wybrany
      component.focusedElement.set(mockInternalEvidence);
      
      component.delete();

      expect(internalEvidenceService.delete).toHaveBeenCalledWith(mockInternalEvidence.internalEvidenceId);
      expect(component.isDelete()).toBeFalsy();
      done();
    });

    it('should handle delete error', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'test error',
        status: 400,
        statusText: 'Bad Request'
      });

      internalEvidenceService.delete.and.returnValue(throwError(() => errorResponse));
      
      component.focusedElement.set(mockInternalEvidence);
      component.delete();

      expect(eventService.httpErrorNotification).toHaveBeenCalled();
      done();
    });
  });

  describe('UI Interactions', () => {
    it('should handle date range change', () => {
      const newDate = { month: 4, year: 2024 };
      component.onDateRangeChange(newDate);
      
      expect(component.month()).toBe(newDate.month);
      expect(component.year()).toBe(newDate.year);
    });

    it('should handle focused row change', () => {
      const event = { row: { data: mockInternalEvidence } };
      component.onFocusedRowChanged(event);
      
      expect(component.focusedElement()).toEqual(mockInternalEvidence);
    });

    it('should not allow operations when month is closed', () => {
      component.isClosed.set(true);
      
      component.addNewRecord();
      expect(component.isAdd()).toBeFalsy();
      
      component.onEdit();
      expect(component.isAdd()).toBeFalsy();
      
      component.delete();
      expect(internalEvidenceService.delete).not.toHaveBeenCalled();
    });
  });
}); 