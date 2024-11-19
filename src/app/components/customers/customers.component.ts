import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppServices } from '../../services/app-services.service';
import { EventService } from '../../services/event-services.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridModule } from 'devextreme-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomChipsButtonComponent } from '../core/custom-chips-button/custom-chips-button.component';
import { Customer } from '../../interface/customers';
import { FilterCriteria } from '../../interface/filterCriteria';
import { CustomDropdownBoxComponent } from '../core/custom-dropdown-box/custom-dropdown-box.component';
import { NewCustomerComponent } from './new-customer/new-customer.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [

  CommonModule,
    DxDataGridModule,
    TranslateModule,
    CustomDropdownBoxComponent,
    CustomChipsButtonComponent,
    NewCustomerComponent,
    DxButtonModule
  ],

  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit, AfterViewInit {
  dropDownBoxMode = input<boolean>(false);

  dataSource: DataSource = new DataSource({});

  appServices = inject(AppServices);
  event = inject(EventService);
  translate = inject(TranslateService);

  heightGrid: number | string = 'calc(100vh - 170px)';
  selectedRows: Customer[] = [];
  focusedRowIndex: number = 0;

  pageSize: number = 50;

  filterValue: string = '';
  filterCriteria: FilterCriteria[] = [
    {
      value: 'customerName',
      label: this.translate.instant('customers.customerName'),
    },
    {
      value: 'city',
      label: this.translate.instant('customers.city'),
    },
  ];
  orderBy = signal<string>('customerName');
  order = signal<string>('ASC');

  filterOptions: FilterCriteria[] = [
    { label: this.translate.instant('customers.isSupplier'), value: 0 },
    { label: this.translate.instant('customers.isRecipient'), value: 1 },
    { label: this.translate.instant('customers.isOffice'), value: 2 },
  ];
  deleteFilter = signal<boolean>(true);
  typeFilter: null | 0 | 1 | 2 = null;
  isAdd = signal<boolean>(false)

  ngOnInit(): void {
    this.getData();
  }

  ngAfterViewInit(): void {}

  getData() {
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
        },
      }),
    });
  }

  getLoadParams() {
    let obj: any = {};
    obj.orderBy = this.orderBy();
    obj.order = this.order();


    switch (this.orderBy()) {
      case 'customerName':
        obj['customerName'] = this.filterValue;
        break;
      case 'city':
        obj['city'] = this.filterValue;
        break;
    }

    switch(this.typeFilter){
      case 0:
        obj['isSupplier'] = true;
        break;
      case 1:
        obj['isRecipient'] = true;
        break;
      case 2:
        obj['isOffice'] = true;
        break;
    }
    return obj;
  }

  onFilterDataChanged(event: any) {
    if (event.selectedItem) {
      this.filterValue = event.filterValue;
      this.orderBy.set(event.selectedItem.value);
      this.getData();
    }
  }

  setSearchCriteria(orderBy: string) {
    if (orderBy !== this.orderBy()) {
      this.orderBy.set(orderBy);
    } else {
      this.switchOrder();
    }
    this.getData();
  }

  switchOrder() {
    if (this.order() === 'ASC') {
      this.order.set('DESC');
      return;
    }

    this.order.set('ASC');
  }

  onValueChangedFilterType(event: any) {
    this.typeFilter = (event === '') ? null : event;
    this.getData();
  }

  addNewRecord(){
    this.isAdd.set(true)
  }
}
