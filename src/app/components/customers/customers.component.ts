import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
  input,
  signal,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  Input,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppServices } from '../../services/app-services.service';
import { EventService } from '../../services/event-services.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import {
  DxDataGridModule,
  DxDropDownBoxModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomChipsButtonComponent } from '../core/custom-chips-button/custom-chips-button.component';
import { Customer } from '../../interface/customers';
import { FilterCriteria } from '../../interface/filterCriteria';
import { CustomDropdownBoxComponent } from '../core/custom-dropdown-box/custom-dropdown-box.component';
import { NewCustomerComponent } from './new-customer/new-customer.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { CustomerService } from '../../services/customer.service';
import { GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericGridColumn } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';


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
    DxButtonModule,
    NgShortcutsComponent,
    DxTooltipModule,
    ConfirmDialogComponent,
    DxScrollViewModule,
    DxDropDownBoxModule,
    GenericDataGridComponent
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('genericDataGrid', { static: false }) genericDataGrid: any;
  @ViewChild('gridDropDown') gridDropDown: any;
  @ViewChild('contractorsBox') contractorsBox: any;
  @Output() onChoosed = new EventEmitter();
  @Input() readOnly: boolean = false;

  dropDownBoxMode = input<boolean>(false);
  className = input<boolean | null | undefined>(false);
  dataSource: DataSource = new DataSource({});
  controlNameForm = input<number | null>(null);

  appServices = inject(AppServices);
  customerServices = inject(CustomerService);
  event = inject(EventService);
  translate = inject(TranslateService);
  cdr = inject(ChangeDetectorRef);

  heightGrid: number | string = 'calc(100vh - 150px)';
  selectedRows: Customer[] = [];
  focusedRowIndex: number = 0;

  pageSize: number = 50;
  mode: 'add' | 'edit' | 'show' = 'add';

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
    {
      value: 'customerVat',
      label: 'NIP',
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
  isAdd = signal<boolean>(false);

  shortcuts: ShortcutInput[] = [];
  isDelete = signal<boolean>(false);
  focusedElement = signal<Customer | null>(null);
  isGridBoxOpened: boolean = false;

  chossingRecord: null | number = null;
  dataSourceDropDown: Customer[] = [];
  searchTimer: any;
  SearchKey: string = '';

  /** Opcje siatki klientów */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 150px)",
      } as GenericGridOptions)
  );

  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant('customers.customerName'),
          dataField: 'customerName',
          width: 400,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 6,
        },
        {
          caption: 'NIP',
          dataField: 'customerVat',
          width: 150,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('customers.street'),
          dataField: 'street',
          width: 200,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('customers.city'),
          dataField: 'city',
          width: 150,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('customers.postalCode'),
          dataField: 'postalCode',
          width: 150,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('customers.email'),
          dataField: 'email',
          width: 200,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('customers.phone'),
          dataField: 'phone',
          width: 150,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('customers.isSupplier'),
          dataField: 'isSupplier',
          width: 100,
          allowSorting: false,
          hidingPriority: 6,
          encodeHtml: false,
          dataType: 'string',
          customizeText: (e: any) => {
            return e.value ? `<img src="../../../assets/images/check-solid.svg" alt="" width="14" />` : '';
          }
        },
        {
          caption: this.translate.instant('customers.isRecipient'),
          dataField: 'isRecipient',
          width: 100,
          allowSorting: false,
          hidingPriority: 6,
          encodeHtml: false,
          dataType: 'string',
          customizeText: (e: any) => {
            return e.value ? `<img src="../../../assets/images/check-solid.svg" alt="" width="14" />` : '';
          }
        },
        {
          caption: this.translate.instant('customers.isOffice'),
          dataField: 'isOffice',
          width: 100,
          allowSorting: false,
          hidingPriority: 6,
          encodeHtml: false,
          dataType: 'string',
          customizeText: (e: any) => {
            return e.value ? `<img src="../../../assets/images/check-solid.svg" alt="" width="14" />` : ''; 
          }
        }
      ] as GenericGridColumn[]
  );

  constructor() {}

  ngOnInit(): void {
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['controlNameForm'] && this.dropDownBoxMode()) {
      this.chossingRecord = changes['controlNameForm'].currentValue;

      if (this.chossingRecord !== null) {
        this.customerServices
          .getCustomerById(this.chossingRecord)
          .subscribe((data) => {
            this.dataSourceDropDown = data;
            this.cdr.detectChanges();
          });
      }
    }
  }

  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: 'alt + n',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: () => {
          this.addNewRecord();
        },
      },
      {
        key: 'F2',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (data) => {
          if (data.event.shiftKey) this.onShow();
          if (!data.event.shiftKey) this.onEdit();
        },
      },
      {
        key: 'del',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: () => {
          this.onDeleteConfirm();
        },
      },
    ];
    this.cdr.detectChanges();
  }

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
        onLoaded: () => {
          setTimeout(() => {
            this.genericDataGrid.focus();
          }, 0);
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
      case 'customerVat':
        obj['customerVat'] = this.filterValue;
        break;
    }

    switch (this.typeFilter) {
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

    if(this.SearchKey !== ''){
      obj['customerName'] = this.SearchKey;
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
    this.typeFilter = event === '' ? null : event;
    this.getData();
  }

  addNewRecord() {
    if (!this.event.sessionData.isActive) return;
    this.mode = 'add';
    this.isAdd.set(true);
  }

  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      const index = data.findIndex(
        (x: any) => x.customerId == Number(event.customerId)
      );

      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }

      this.cdr.detectChanges();
    });
  }

  onDeleteConfirm() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(true);
  }

  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  delete() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().customerId;

    this.customerServices.deleteCustomer(id).subscribe(() => {
      this.dataSource.reload().then(() => {
        this.focusedRowIndex = 0;
      });
    });
  }

  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  onEdit() {
    if (!this.event.sessionData.isActive) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  onRowDblClick(e: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(e.data);
      return;
    }

    this.onEdit();
  }

  onChoosingRecord = (e: Customer) => {
    if (this.event.sessionData.isActive) {
      this.dataSourceDropDown = [e];
      this.chossingRecord = e.customerId;
      this.onChoosed.emit(e);
      this.isGridBoxOpened = false;
      this.SearchKey = '';
    }
  };

  onOpenedChanged(e: any) {
    if (e) {
      try {
        setTimeout(() => {
          this.gridDropDown.instance.focus();
        }, 500);
      } catch {}
      this.getData();
    } else {
      this.isGridBoxOpened = false;
    }
  }

  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
    }
  };

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

  onColumnHeaderClick(event: any) {
    this.orderBy.set(event);
  }

  onOrderClick(event: any) {
    this.order.set(event);
    this.getData();
  }
}
