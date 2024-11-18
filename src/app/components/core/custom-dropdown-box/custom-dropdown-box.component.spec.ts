import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DevExtremeModule } from 'devextreme-angular';

import { CustomDropdownBoxComponent } from './custom-dropdown-box.component';

describe('CustomDropdownBoxComponent', () => {
  let component: CustomDropdownBoxComponent;
  let fixture: ComponentFixture<CustomDropdownBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomDropdownBoxComponent ],
      imports: [HttpClientTestingModule, RouterTestingModule, TranslateModule, TranslateModule.forRoot(), FormsModule, ReactiveFormsModule
      , DevExtremeModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDropdownBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
