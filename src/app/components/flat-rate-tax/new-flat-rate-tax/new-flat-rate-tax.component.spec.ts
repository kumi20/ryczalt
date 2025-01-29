import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFlatRateTaxComponent } from './new-flat-rate-tax.component';

describe('NewFlatRateTaxComponent', () => {
  let component: NewFlatRateTaxComponent;
  let fixture: ComponentFixture<NewFlatRateTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFlatRateTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFlatRateTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
