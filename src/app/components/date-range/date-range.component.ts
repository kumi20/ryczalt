import { Component, EventEmitter, Output, signal, inject, OnInit, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event-services.service';

/**
 * Component for managing date range selection with month and year controls.
 * Provides UI for incrementing/decrementing month and year values.
 * Changes are broadcasted across browser tabs and emitted to parent components.
 *
 * @example
 * ```html
 * <app-date-range
 *   (dateRangeChange)="onDateRangeChange($event)">
 * </app-date-range>
 * ```
 */
@Component({
  selector: 'app-date-range',
  imports: [CommonModule, TranslateModule],
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss']
})
export class DateRangeComponent implements OnInit {
  /** Emits when either month or year changes */
  @Output() dateRangeChange = new EventEmitter<{month: number, year: number}>();
  @Input() hideMonth: boolean = false;

  /** Service for handling cross-tab communication */
  event = inject(EventService);

  /** Current selected month (1-12) */
  month = signal<number>(this.event.globalDate.month);

  /** Current selected year */
  year = signal<number>(this.event.globalDate.year);

  ngOnInit() {
    const channel = new BroadcastChannel('dataRange');
    channel.onmessage = (event) => {
      this.event.globalDate = event.data;
      this.month.set(event.data.month);
      this.year.set(event.data.year);
      this.dateRangeChange.emit({
        month: this.month(),
        year: this.year()
      });
    };
  }

  /**
   * Decrements the month value, handling year rollover when going from January to December
   */
  minusMonth() {
    if (this.month() === 1) {
      this.month.set(12);
      this.year.update(y => y - 1);
    } else {
      this.month.update(m => m - 1);
    }
    this.emitDateChange();
  }

  /**
   * Increments the month value, handling year rollover when going from December to January
   */
  plusMonth() {
    if (this.month() === 12) {
      this.month.set(1);
      this.year.update(y => y + 1);
    } else {
      this.month.update(m => m + 1);
    }
    this.emitDateChange();
  }

  /**
   * Decrements the year value
   */
  minusYear() {
    this.year.update(y => y - 1);
    this.emitDateChange();
  }

  /**
   * Increments the year value
   */
  plusYear() {
    this.year.update(y => y + 1);
    this.emitDateChange();
  }

  /**
   * Updates global date state, broadcasts changes to other tabs,
   * and emits changes to parent component
   * @private
   */
  private emitDateChange() {
    this.event.globalDate.month = this.month();
    this.event.globalDate.year = this.year();
    localStorage.setItem('dataRange', JSON.stringify(this.event.globalDate));

    const channel = new BroadcastChannel('dataRange');
    channel.postMessage(this.event.globalDate);

    this.dateRangeChange.emit({
      month: this.month(),
      year: this.year()
    });
  }
}
