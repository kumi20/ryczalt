import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JpkService } from './jpk.service';
import { environment } from '../../environments/environment';

describe('JpkService', () => {
  let service: JpkService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JpkService]
    });
    service = TestBed.inject(JpkService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch JPK details', () => {
    const mockJpkDetails = {
      id: 1,
      submissionId: 'JPK-001',
      jpkType: 'VAT',
      status: 'SUBMITTED',
      documentCount: 100
    };

    service.getJpkDetails(1).subscribe(details => {
      expect(details).toEqual(mockJpkDetails);
    });

    const req = httpMock.expectOne(`${environment.domain}jpk/details/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockJpkDetails);
  });
});
