import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegisterBuyComponent } from './vat-register-buy.component';

describe('VatRegisterBuyComponent', () => {
  let component: VatRegisterBuyComponent;
  let fixture: ComponentFixture<VatRegisterBuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VatRegisterBuyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VatRegisterBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
