import { TestBed } from '@angular/core/testing';

import { GenericDataGridService } from './generic-data-grid.service';

describe('GenericDataGridService', () => {
  let service: GenericDataGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericDataGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
