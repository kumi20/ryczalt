import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVatRegisterBuyComponent } from './new-vat-register-buy.component';

describe('NewVatRegisterBuyComponent', () => {
  let component: NewVatRegisterBuyComponent;
  let fixture: ComponentFixture<NewVatRegisterBuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewVatRegisterBuyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewVatRegisterBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
