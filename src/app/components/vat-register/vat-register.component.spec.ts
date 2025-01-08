import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegisterComponent } from './vat-register.component';

describe('VatRegisterComponent', () => {
  let component: VatRegisterComponent;
  let fixture: ComponentFixture<VatRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VatRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VatRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
