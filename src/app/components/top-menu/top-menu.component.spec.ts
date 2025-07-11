import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TopMenuComponent } from './top-menu.component';

describe('TopMenuComponent', () => {
  let component: TopMenuComponent;
  let fixture: ComponentFixture<TopMenuComponent>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockMenuItems = {
    items: [
      {
        id: '1',
        name: 'menu.dashboard',
        url: 'content/dashboard',
        items: [],
        signature: 'D',
        classCss: 'greenHeader'
      },
      {
        id: '2',
        name: 'menu.reports',
        url: 'content/reports',
        items: [],
        signature: 'R',
        classCss: 'blueHeader'
      }
    ]
  };

  beforeEach(async () => {
    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [
        TopMenuComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopMenuComponent);
    component = fixture.componentInstance;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showMenu).toBe(true);
    expect(component.products).toHaveSize(2);
    expect(component.products[0].name).toBe('menu.start');
    expect(component.products[1].name).toBe('menu.companies');
    expect(component.showFirstSubmenuModes.name).toBe('onHover');
    expect(component.showFirstSubmenuModes.delay.show).toBe(0);
    expect(component.showFirstSubmenuModes.delay.hide).toBe(500);
  });

  it('should check localStorage on ngOnInit', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    component.ngOnInit();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('dataPortal');
    expect(component.showMenu).toBe(true);
  });

  it('should hide menu when dataPortal exists in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue('someValue');
    
    component.ngOnInit();
    
    expect(component.showMenu).toBe(false);
  });

  it('should update products when items are provided', () => {
    component.items = mockMenuItems;
    
    component.ngOnChanges();
    
    expect(component.products).toEqual(mockMenuItems.items);
    expect(component.products[0].url).toBe('/content/dashboard');
    expect(component.products[1].url).toBe('/content/reports');
    expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
  });

  it('should use default products when no items provided', () => {
    component.items = { items: [] };
    
    component.ngOnChanges();
    
    expect(component.products).toHaveSize(2);
    expect(component.products[0].name).toBe('menu.start');
    expect(component.products[1].name).toBe('menu.companies');
    expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
  });

  it('should use default products when items is null', () => {
    component.items = null;
    
    component.ngOnChanges();
    
    expect(component.products).toHaveSize(2);
    expect(component.products[0].name).toBe('menu.start');
    expect(component.products[1].name).toBe('menu.companies');
  });

  it('should handle item click events', () => {
    spyOn(console, 'log');
    const mockEvent = { itemData: { id: '1', name: 'menu.dashboard' } };
    
    component.itemClick(mockEvent);
    
    expect(console.log).toHaveBeenCalledWith(mockEvent);
  });

  it('should add slash prefix to URLs', () => {
    const itemsWithoutSlash = {
      items: [
        { id: '1', name: 'test1', url: 'content/test1' },
        { id: '2', name: 'test2', url: 'content/test2' }
      ]
    };
    component.items = itemsWithoutSlash;
    
    component.ngOnChanges();
    
    expect(component.products[0].url).toBe('/content/test1');
    expect(component.products[1].url).toBe('/content/test2');
  });

  it('should handle empty items array', () => {
    component.items = { items: [] };
    
    component.ngOnChanges();
    
    expect(component.products).toHaveSize(2);
    expect(component.products[0].name).toBe('menu.start');
    expect(component.products[1].name).toBe('menu.companies');
  });

  it('should preserve original URL structure when processing items', () => {
    const itemsWithSubItems = {
      items: [
        {
          id: '1',
          name: 'parent',
          url: 'content/parent',
          items: [
            { id: '1-1', name: 'child1', url: 'content/child1' },
            { id: '1-2', name: 'child2', url: 'content/child2' }
          ]
        }
      ]
    };
    component.items = itemsWithSubItems;
    
    component.ngOnChanges();
    
    expect(component.products[0].url).toBe('/content/parent');
    expect(component.products[0].items).toEqual(itemsWithSubItems.items[0].items);
  });

  it('should handle items with existing slash prefix', () => {
    const itemsWithSlash = {
      items: [
        { id: '1', name: 'test1', url: '/content/test1' },
        { id: '2', name: 'test2', url: 'content/test2' }
      ]
    };
    component.items = itemsWithSlash;
    
    component.ngOnChanges();
    
    expect(component.products[0].url).toBe('//content/test1'); // Double slash because it adds prefix
    expect(component.products[1].url).toBe('/content/test2');
  });
});
