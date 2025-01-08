import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlateRateComponent } from './flate-rate.component';

describe('FlateRateComponent', () => {
  let component: FlateRateComponent;
  let fixture: ComponentFixture<FlateRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlateRateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlateRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
