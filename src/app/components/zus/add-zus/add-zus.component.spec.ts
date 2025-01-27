import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddZusComponent } from './add-zus.component';

describe('AddZusComponent', () => {
  let component: AddZusComponent;
  let fixture: ComponentFixture<AddZusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddZusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddZusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
