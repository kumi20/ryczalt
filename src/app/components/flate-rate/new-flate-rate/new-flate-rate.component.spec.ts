import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFlateRateComponent } from './new-flate-rate.component';

describe('NewFlateRateComponent', () => {
  let component: NewFlateRateComponent;
  let fixture: ComponentFixture<NewFlateRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFlateRateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFlateRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
