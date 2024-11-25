import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CountryService } from '../../services/country-service';
import { Country } from '../../interface/country';
import { EventService } from '../../services/event-services.service';
import { DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TranslateModule,
    DxDropDownBoxModule,
  ],
  templateUrl: './country.component.html',
  styleUrl: './country.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryComponent implements OnInit, OnChanges {
  @Output() onChoosed = new EventEmitter();
  @Output() setPLId = new EventEmitter();

  @ViewChild('gridDropDown') gridDropDown: any;

  dropDownBoxMode = input<boolean>(false);
  className = input<boolean>(false);
  controlNameForm = input<string>('');

  countryServices = inject(CountryService);
  event = inject(EventService);

  countryList = signal<Country[]>([]);
  heightGrid: number | string = 'calc(100vh - 100px)';
  focusedRowIndex: number = 0;
  pageSize: number = 300;
  isGridBoxOpened: boolean = false;

  chossingRecord: null | string = null;

  constructor() {}

  ngOnInit() {
    this.countryServices.getCountries().subscribe({
      next: (data: Country[]) => {
        this.countryList.set(data);

        const inPl = data.find((x) => x.name === 'Polska');
        if (inPl) {
          this.setPLId.emit(inPl.countryId);
        }
        if(this.chossingRecord != null) {
          const index = data.findIndex((x) => x.name === this.chossingRecord);
          if (index >= 0) {
            this.focusedRowIndex = index;
          }
        }
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['controlNameForm'] && this.dropDownBoxMode()) {
      this.chossingRecord = changes['controlNameForm'].currentValue;
    }
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
    }
  };

  onRowDblClick(e: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(e.data);
    }
  }

  onChoosingRecord = (e: Country) => {
    if (this.event.sessionData.isActive) {

      this.chossingRecord = e.name;
      this.onChoosed.emit(e);
      this.isGridBoxOpened = false;
    }
  };

  onOpenedChanged(e: any) {
    if (e) {
      try {
        setTimeout(() => {
          this.gridDropDown.instance.focus();
        }, 500);
      } catch {}
    } else {
      this.isGridBoxOpened = false;
    }
  }
}
