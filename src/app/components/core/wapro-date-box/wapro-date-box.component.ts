import {
  Component,
  forwardRef,
  OnInit,
  OnDestroy,
  Output,
  ViewEncapsulation,
  ViewChild,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService } from '../../../services/event-services.service';
import { KeyDownEvent, ValueChangedEvent } from 'devextreme/ui/date_box';
import { DxDateBoxModule } from 'devextreme-angular';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => WaproDateBoxComponent),
  multi: true,
};

@Component({
  selector: 'wapro-date-box',
  templateUrl: './wapro-date-box.component.html',
  styleUrls: ['./wapro-date-box.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
  imports: [CommonModule, DxDateBoxModule],
})
export class WaproDateBoxComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Input() displayFormat = 'yyyy-MM-dd';
  @Input() readOnly = false;
  @Input() type: 'date' | 'datetime' | 'time' = 'date';
  @Input() disabled = false;
  @Input() errorClass = false;
  @Input() width: number | string | null = null;
  @Input() noMaxWidth = false;

  @Output() onValueChanged = new EventEmitter();
  @Output() focusedOut = new EventEmitter<boolean>();
  @Output() focusedIn = new EventEmitter<boolean>();

  @ViewChild('dateBox') private dateBox: any;

  private _value: string | number | Date = '';

  isHover = false;
  isFocus = false;
  opened = false;
  notOpen = false;
  changeByUser = false;

  plusBtn = {
    icon: 'icon absui-icon--add',
    stylingMode: 'text',
    onClick: () => this.addDay(),
  };

  minusBtn = {
    icon: 'icon absui-icon--remove',
    stylingMode: 'text',
    onClick: () => this.subtractDay(),
  };

  calendarBtn = {
    icon: 'icon absui-icon--calendar-month-unselect',
    stylingMode: 'text',
    tabIndex: -1,
    onClick: () => {
      this.opened = !this.opened;
      this.cd.detectChanges();
      if (this.opened) this.event.setFocus(this.dateBox);
    },
  };

  calendarOptions: any;

  constructor(private event: EventService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeCalendarOptions();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources if needed
  }

  get myValue(): string | number | Date {
    return this._value;
  }

  set myValue(v: string | number | Date) {
    if (v !== this._value) {
      this._value = v;
      try {
        this.onChange(v);
      } catch (error) {
        console.error('Error in onChange:', error);
      }
    }
  }

  private initializeCalendarOptions(): void {
    this.calendarOptions = {
      onContentReady: (e: any) => {
        setTimeout(() => {
          e.component.option('inputAttr', { readonly: true });
        }, 500);

        const todayBtn =
          this.dateBox.element.nativeElement.getElementsByClassName(
            'dx-button-today'
          )[0] as HTMLElement;

        if (this.type !== 'datetime') {
          this.disableButtons();
          e.element.onclick = () => this.handleDateSelection(e);
        }

        todayBtn.onclick = () => this.handleTodaySelection();
      },
    };
  }

  private disableButtons(): void {
    const buttonSelectors = [
      '.dx-widget.dx-button.dx-button-mode-contained.dx-button-normal.dx-button-has-text.dx-popup-done',
      '.dx-widget.dx-button.dx-button-mode-contained.dx-button-normal.dx-button-has-text.dx-popup-cancel',
    ];

    buttonSelectors.forEach((selector) => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach((button) => button.classList.add('disabledBtn'));
    });
  }

  private handleDateSelection(e: any): void {
    const newDate = new DatePipe('en-US').transform(
      e.component.option('value'),
      'yyyy-MM-ddTHH:mm:ss'
    );
    this.changeByUser = true;
    this.myValue = newDate ?? '';
    this.cd.detectChanges();
  }

  private handleTodaySelection(): void {
    const newDate = new DatePipe('en-US').transform(
      new Date(),
      'yyyy-MM-ddTHH:mm:ss'
    );
    this.changeByUser = true;
    this.myValue = newDate ?? '';
    this.opened = false;
    this.cd.detectChanges();
  }

  addDay = (): void => {
    this.changeDate(1);
  };

  subtractDay = (): void => {
    this.changeDate(-1);
  };

  private changeDate(days: number): void {
    if (!this.myValue) {
      this.myValue =
        new DatePipe('en-US').transform(new Date(), 'yyyy-MM-ddTHH:mm:ss') ??
        '';
    }

    const newDate = new DatePipe('en-US').transform(
      new Date(this.myValue).getTime() + days * 24 * 60 * 60 * 1000,
      'yyyy-MM-ddTHH:mm:ss'
    );

    this.changeByUser = true;
    this.myValue = newDate ?? '';
    this.cd.detectChanges();
  }

  openBox = (): void => {
    if (!this.notOpen) {
      this.opened = !this.opened;
    }
  };

  onOpened = (): void => {
    this.notOpen = true;
  };

  onClosed = (): void => {
    setTimeout(() => {
      this.notOpen = false;
    }, 500);
  };

  onValueChangedDate = (e: ValueChangedEvent): void => {
    if (this.type !== 'datetime') {
      this.opened = false;
      this.cd.detectChanges();
    }
    const event = { ...e, event: e.event ?? {} };
    this.onValueChanged.emit(event);
    this.changeByUser = false;
  };

  onBlur = (e: any): void => {
    e.element.classList.remove('dx-state-focused');
  };

  keydown = (e: KeyDownEvent): void => {
    if (!this.readOnly) {
      const originalEvent = (e.event as any).originalEvent;
      if (originalEvent.code === 'ArrowDown' && originalEvent.shiftKey)
        this.subtractDay();
      if (originalEvent.code === 'ArrowUp' && originalEvent.shiftKey)
        this.addDay();
      this.cd.detectChanges();
    }
  };

  mouseover = (): void => {
    this.isHover = true;
  };

  mouseout = (): void => {
    this.isHover = false;
  };

  onFocusIn = (): void => {
    this.isFocus = true;
    this.focusedIn.emit(true);
  };

  onFocusOut = (): void => {
    this.isFocus = false;
    this.focusedOut.emit(true);
  };

  onChange = (_: any): void => {};
  onTouched = (): void => {};

  writeValue(value: any): void {
    this.myValue = value;
    this.cd.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.cd.detectChanges();
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
    this.cd.detectChanges();
  }

  setDisabledState?(_isDisabled: boolean): void {
    // Implementation not provided
  }
}
