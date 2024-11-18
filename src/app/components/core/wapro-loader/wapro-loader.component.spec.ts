import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaproLoaderComponent } from './wapro-loader.component';

describe('WaproLoaderComponent', () => {
  let component: WaproLoaderComponent;
  let fixture: ComponentFixture<WaproLoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WaproLoaderComponent],
    });
    fixture = TestBed.createComponent(WaproLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
