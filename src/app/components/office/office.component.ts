import { ChangeDetectorRef, Component, EventEmitter, inject, Input, input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import { EventService } from '../../services/event-services.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Office } from '../../interface/office';
import { AppServices } from '../../services/app-services.service';

@Component({
  selector: 'app-office',
  imports: [DxDataGridModule, TranslateModule, CommonModule, DxDropDownBoxModule],
  templateUrl: './office.component.html',
  styleUrl: './office.component.scss',
})
export class OfficeComponent implements OnInit, OnChanges {
  @ViewChild('dxGrid') dxGrid: any;
  @ViewChild('contractorsBox') contractorsBox: any;
  @Output() onChoosed = new EventEmitter();
  @ViewChild('gridDropDown') gridDropDown: any;
  className = input<boolean>(false);
  @Input() readOnly: boolean = false;
  dataSource: DataSource = new DataSource({});
  event = inject(EventService);
  heightGrid: number | string = 'calc(100vh - 220px)';
  focusedRowIndex: number = 0;
  pageSize: number = 200;

  dropDownBoxMode = input<boolean>(false);

  appServices = inject(AppServices);

  chossingRecord: null | number = null;
  isGridBoxOpened: boolean = false;
  searchTimer: any;
  SearchKey: string = '';
  cdr = inject(ChangeDetectorRef);
  controlNameForm = input<any>(null);
  dataSourceDropDown: any[] = [];
  constructor() {}

  ngOnInit(): void {
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['controlNameForm'] && this.dropDownBoxMode()) {
      this.chossingRecord = changes['controlNameForm'].currentValue;
      if (this.chossingRecord !== null) {
        this.appServices
          .getAuth(`tax-offices?taxOfficeId=${this.chossingRecord}`)
          .subscribe((data) => {
            this.dataSourceDropDown = data;
            this.cdr.detectChanges();
          });
      }
    }
  }

  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'taxOfficeId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}tax-offices`,
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        loadParams: this.getLoadParams(),
        onLoaded: (data) => {
          setTimeout(() => {
            this.event.setFocus(this.dxGrid);
          }, 0);
        },
      }),
    });
  }

  getLoadParams() {
    let obj: any = {};
    if(this.SearchKey !== ''){
      obj['name'] = this.SearchKey;
    }
    return obj;
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  onRowDblClick(event: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(event.data);
    }
  }

  onChoosingRecord = (e: any) => {
    if (this.event.sessionData.isActive) {

      this.chossingRecord = e.taxOfficeId;
      this.onChoosed.emit(e);
      this.isGridBoxOpened = false;
      this.SearchKey = '';
      this.getData();
    }
  };

  onFocusedRowChanged(event: any) {
    console.log(event);
  }

  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
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

  grid_onInput(){
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.SearchKey = this.contractorsBox.text;

      this.getData();
      this.isGridBoxOpened = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.contractorsBox?.instance?.focus();
      }, 500);
    }, 500);
  }
}
