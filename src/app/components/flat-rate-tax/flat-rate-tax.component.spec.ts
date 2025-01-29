import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatRateTaxComponent } from './flat-rate-tax.component';

describe('FlatRateTaxComponent', () => {
  let component: FlatRateTaxComponent;
  let fixture: ComponentFixture<FlatRateTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatRateTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlatRateTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
