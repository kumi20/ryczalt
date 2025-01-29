import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import { EventService } from '../../services/event-services.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-office',
  imports: [DxDataGridModule, TranslateModule, CommonModule],
  templateUrl: './office.component.html',
  styleUrl: './office.component.scss',
})
export class OfficeComponent implements OnInit {
  @ViewChild('dxGrid') dxGrid: any;
  dataSource: DataSource = new DataSource({});
  event = inject(EventService);
  heightGrid: number | string = 'calc(100vh - 220px)';
  focusedRowIndex: number = 0;
  pageSize: number = 200;

  constructor() {}

  ngOnInit(): void {
    this.getData();
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
        onLoaded: (data) => {
          setTimeout(() => {
            this.event.setFocus(this.dxGrid);
          }, 0);
        },
      }),
    });
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  onRowDblClick(event: any) {
    console.log(event);
  }

  onFocusedRowChanged(event: any) {
    console.log(event);
  }
}
