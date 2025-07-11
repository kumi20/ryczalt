import { TestBed } from '@angular/core/testing';

import { JpkService } from './jpk.service';

describe('JpkService', () => {
  let service: JpkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JpkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
