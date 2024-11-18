import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ElementRef,
  HostListener,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/event-services.service';
import { ValueChangedEvent as SelectBoxValueChanged } from 'devextreme/ui/select_box';
import { KeyUpEvent, ValueChangedEvent } from 'devextreme/ui/text_box';
import {
  ICustomDropDownBoxValueChanged,
  ICustomSearchItem,
  ICustomSearchItemType,
} from './custom-dropdown-box.model';
import { ClickEvent } from 'devextreme/ui/button';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxTooltipModule,
} from 'devextreme-angular';

@Component({
  selector: 'app-custom-dropdown-box',
  templateUrl: './custom-dropdown-box.component.html',
  styleUrls: ['./custom-dropdown-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DxButtonModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxTooltipModule,
  ],
})
export class CustomDropdownBoxComponent implements OnInit, OnChanges {
  @Input() customSearchText: string = '';
  @Input() hideFilter: boolean = false;
  @Input() selectedItem: string = '';
  @Input() items: ICustomSearchItem[] = [];
  @Input() width: number = 200;

  @ViewChild('inputBox') inputBox: any = null;
  getFilterValue() {
    return this._filterValue;
  }

  private selectedItemObject: ICustomSearchItem | null = null;
  @Input() set filterValue(val: string | number) {
    const selectedItem = this.findSelectedItemObject(this.selectedItem);
    this.selectedItemObject = selectedItem;
    if (
      selectedItem &&
      selectedItem.type == 'data' &&
      typeof val === 'string'
    ) {
      try {
        this._filterValue = val.replace(/-/g, '');
        this.selectedDataType = selectedItem?.type;
      } catch {}
    } else {
      this._filterValue = val;
    }
  }

  @Output() selectedItemChange: EventEmitter<string> = new EventEmitter();
  @Output() filterValueChange: EventEmitter<string> = new EventEmitter();
  @Output() onValueChanged: EventEmitter<ICustomDropDownBoxValueChanged> =
    new EventEmitter();
  protected _filterValue: string | number | any = '';

  selectedDataType: ICustomSearchItemType = 'string';
  selectBoxOpened = false;
  unicalGuid = new Date().getTime() + Math.round(Math.random() * 10000);
  searchIn = 'Szukaj w';
  searchTxt = 'Szukaj';

  autoEmitSubject: Subject<string> = new Subject();
  destroy$: Subject<void> = new Subject();
  autoEmit$ = this.autoEmitSubject
    .asObservable()
    .pipe(takeUntil(this.destroy$), debounceTime(300));
  mask: string = '';
  maskRules: any = null; // typ w devexpressie -> any
  searchButton = {
    icon: 'icon icon-search',
    type: 'default',
    onClick: (e: ClickEvent) => {
      e.element.closest('dx-text-box')?.classList.add('dx-state-focused');
      this.search();
    },
  };
  clearButton = {
    icon: 'icon icon-close-custom-search-box',
    type: 'default',
    stylingMode: 'text',
    elementAttr: {
      class: 'clear-button',
    },

    onClick: () => {
      this._filterValue = '';
      this.search();
    },
  };
  icon = 'icon dx-icon-spindown';
  focus = false;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.selectBoxOpened = false;
    }
  }

  constructor(
    private translate: TranslateService,
    private eRef: ElementRef,
    public event: EventService
  ) {
    this.initializeTranslation();
  }

  private initializeTranslation(): void {
    const lang = localStorage.getItem('lang') || 'pl';
    this.translate.setDefaultLang(lang);
    this.event.language.pipe(takeUntilDestroyed()).subscribe((lang) => {
      this.translate.use(lang);
    });
  }

  ngOnInit(): void {
    // this.getTranslations();

    this.autoEmit$.subscribe({
      next: () => {
        this.emitChanges(true);
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isValidDate() {
    if (this.selectedDataType === 'data') {
      if (!this._filterValue) return true;

      const convertedDate = new Date(
        this._filterValue.substr(0, 4) +
          '-' +
          this._filterValue.substr(4, 2) +
          '-' +
          this._filterValue.substr(6, 2)
      );
      if (!(convertedDate instanceof Date && !isNaN(convertedDate.getTime()))) {
        this.event.showNotification(
          'error',
          this.translate.instant('form.invalidDate')
        );
        return false;
      }
    }
    return true;
  }

  keyup = (e: any) => {
    if (e.event.key == 'Enter') {
      if (!this.isValidDate()) return;
      this.emitChanges();
    }
  };

  getTranslations() {
    this.translate.get('searchIn').subscribe((text) => {
      this.searchIn = text;
    });
    this.translate.get('search').subscribe((text) => {
      this.searchTxt = text;
    });
  }

  search() {
    if (!this.isValidDate()) return;

    this.selectBoxOpened = false;
    this.emitChanges();
  }

  toggleSelectBox() {
    this.selectBoxOpened = !this.selectBoxOpened;
  }

  emitChanges(autoEmit: boolean = false) {
    const selectedItem = this.findSelectedItemObject(
      this.selectedItem
    ) as ICustomSearchItem;
    this.selectedDataType = selectedItem?.type as ICustomSearchItemType;
    this.onValueChanged.emit({
      autoEmit,
      selectedItem,
      filterValue:
        selectedItem?.type == 'data'
          ? this.formatDate(this._filterValue)
          : this._filterValue,
    });
  }

  formatDate(value: string): string | null {
    if (!value || value.length < 8) return null;
    return (
      value.substring(0, 4) +
      '-' +
      value.substring(4, 6) +
      '-' +
      value.substring(6, 8)
    );
  }

  findSelectedItemObject(item: string): ICustomSearchItem | null {
    return this.items.find((el) => el.value === item) || null;
  }

  onSelectBoxValueChanged(e: SelectBoxValueChanged) {
    this.clearMasks();
    this.filterValue = '';
    const item = this.findSelectedItemObject(e.value);
    this.selectedItemObject = item as ICustomSearchItem;
    if (item?.type == 'data') {
      this._filterValue = '';
    }
    this.emitChanges();
  }

  onTextValueChanged(e: any) {
    if (e.value?.length == 1) {
      const item = this.findSelectedItemObject(this.selectedItem);
      if (item?.type == 'data') {
        this.selectedDataType = item.type;
        this.mask = 'RXXX-MX-DX';
        this.maskRules = {
          R: /[1-2]/,
          X: /[0-9]/,
          M: /[0-1]/,
          D: /[0-3]/,
        };
      }
    }

    if (e.value === '' || e.value === null || e.value === undefined) {
      this.clearMasks();
      if (e.event) {
        this.emitChanges();
      }
    } else if (this.selectedItemObject?.autoEmit) {
      this.autoEmitSubject.next(e.value);
    }
  }

  clearMasks() {
    this.mask = '';
    this.maskRules = null;
  }

  setIcon(opened: boolean) {
    this.icon = opened ? 'icon dx-icon-spinup' : 'icon dx-icon-spindown';
  }

  onFocusIn = () => {
    this.focus = true;
  };

  onFocusOut = () => {
    this.focus = false;
  };

  onOpened() {
    this.setIcon(true);
  }

  onClosed() {
    this.setIcon(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedItem']?.currentValue) {
      const selectedItem = this.findSelectedItemObject(this.selectedItem);
      this.selectedDataType = selectedItem?.type as ICustomSearchItemType;
    }
  }

  focusInput() {
    if (this.inputBox) this.inputBox.instance.focus();
  }
}
