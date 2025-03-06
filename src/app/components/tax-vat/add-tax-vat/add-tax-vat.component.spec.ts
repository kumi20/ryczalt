import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaxVatComponent } from './add-tax-vat.component';

describe('AddTaxVatComponent', () => {
  let component: AddTaxVatComponent;
  let fixture: ComponentFixture<AddTaxVatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaxVatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaxVatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
