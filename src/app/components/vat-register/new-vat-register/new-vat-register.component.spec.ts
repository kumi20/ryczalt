import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVatRegisterComponent } from './new-vat-register.component';

describe('NewVatRegisterComponent', () => {
  let component: NewVatRegisterComponent;
  let fixture: ComponentFixture<NewVatRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewVatRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewVatRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
