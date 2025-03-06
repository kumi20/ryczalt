import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxVatComponent } from './tax-vat.component';

describe('TaxVatComponent', () => {
  let component: TaxVatComponent;
  let fixture: ComponentFixture<TaxVatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxVatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxVatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
