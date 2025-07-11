import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JpkDetailsComponent } from './jpk-details.component';

describe('JpkDetailsComponent', () => {
  let component: JpkDetailsComponent;
  let fixture: ComponentFixture<JpkDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JpkDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JpkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
