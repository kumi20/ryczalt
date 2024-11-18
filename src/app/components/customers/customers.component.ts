import { Component, OnInit, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppServices } from '../../services/app-services.service';
import { EventService } from '../../services/event-services.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridModule } from 'devextreme-angular';

import { Customer } from '../../interface/customers';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent implements OnInit{
  dropDownBoxMode = input<boolean>(false)

  dataSource: DataSource = new DataSource({});

  appServices = inject(AppServices);
  event = inject(EventService);

  heightGrid: number = 500;
  selectedRows: Customer[] = [];
  focusedRowIndex: number = 0;

  pageSize: number = 200;

  ngOnInit(): void {
   console.log('ffff')
   this.getData()
  }

  getData(){
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'customerId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}customers`,
        loadParams: this.getLoadParams(),
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        onLoaded: (data: Customer[]) => {
          console.log(data);
        }
      })
    })
  }

  getLoadParams() {
    let obj = {};
    return obj;
  }
}
