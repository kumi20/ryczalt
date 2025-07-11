import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JpkSubmissionsComponent } from './jpk-submissions.component';

describe('JpkSubmissionsComponent', () => {
  let component: JpkSubmissionsComponent;
  let fixture: ComponentFixture<JpkSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JpkSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JpkSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
