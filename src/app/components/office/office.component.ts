import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  computed,
  signal,
} from "@angular/core";
import { DxDataGridModule, DxDropDownBoxModule } from "devextreme-angular";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import DataSource from "devextreme/data/data_source";
import { EventService } from "../../services/event-services.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { Office } from "../../interface/office";
import { AppServices } from "../../services/app-services.service";
import {
  GenericGridColumn,
  GenericGridOptions,
} from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";
import { CustomDropdownBoxComponent } from "../core/custom-dropdown-box/custom-dropdown-box.component";
import { FilterCriteria } from '../../interface/filterCriteria';

@Component({
  selector: "app-office",
  imports: [
    DxDataGridModule,
    TranslateModule,
    CommonModule,
    DxDropDownBoxModule,
    GenericDataGridComponent,
    CustomDropdownBoxComponent,
  ],
  templateUrl: "./office.component.html",
  styleUrl: "./office.component.scss",
})
export class OfficeComponent implements OnInit, OnChanges {
  @ViewChild("genericDataGrid") genericDataGrid: any;
  @ViewChild("contractorsBox") contractorsBox: any;
  @Output() onChoosed = new EventEmitter();
  @ViewChild("gridDropDown") gridDropDown: any;
  className = input<boolean>(false);
  @Input() readOnly: boolean = false;
  dataSource: DataSource = new DataSource({});
  event = inject(EventService);
  heightGrid: number | string = "calc(100vh - 220px)";
  focusedRowIndex: number = 0;
  pageSize: number = 200;

  dropDownBoxMode = input<boolean>(false);

  appServices = inject(AppServices);

  chossingRecord: null | number = null;
  isGridBoxOpened: boolean = false;
  searchTimer: any;
  SearchKey: string = "";
  cdr = inject(ChangeDetectorRef);
  controlNameForm = input<any>(null);
  dataSourceDropDown: any[] = [];
  translate = inject(TranslateService);

  filterValue: string = '';
  filterCriteria: FilterCriteria[] = [
    {
      value: 'name',
      label: this.translate.instant('customers.name'),
    },
    {
      value: 'city',
      label: this.translate.instant('customers.city'),
    },
    {
      value: 'address',
      label: this.translate.instant('customers.street'),
    },
    {
      value: 'voivodeship',
      label: this.translate.instant('company.voivodeship'),
    },    
  ];
  orderBy = signal<string>('name');
  order = signal<string>('ASC');

  /** Opcje siatki klientów */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 180px)",
      } as GenericGridOptions)
  );

  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant("taxOffices.code"),
          dataField: "code",
          width: 200,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 1,
        },
        {
          caption: this.translate.instant("taxOffices.name"),
          dataField: "name",
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 2,
        },
        {
          caption: this.translate.instant("taxOffices.postalCode"),
          dataField: "postalCode",
          width: 200,
          minWidth: 100,
          allowSorting: false,
          hidingPriority: 5,
        },
        {
          caption: this.translate.instant("taxOffices.city"),
          dataField: "city",
          width: 200,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 3,
        },
        {
          caption: this.translate.instant("taxOffices.address"),
          dataField: "address",
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 4,
        },
        {
          caption: this.translate.instant("taxOffices.phone"),
          dataField: "phone",
          width: 200,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant("taxOffices.email"),
          dataField: "email",
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 7,
        },
      ] as GenericGridColumn[]
  );

  constructor() {}

  ngOnInit(): void {
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["controlNameForm"] && this.dropDownBoxMode()) {
      this.chossingRecord = changes["controlNameForm"].currentValue;
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
        key: "taxOfficeId",
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}tax-offices`,
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        loadParams: this.getLoadParams(),
        onLoaded: (data) => {
          setTimeout(() => {
            this.genericDataGrid.focus();
          }, 0);
        },
      }),
    });
  }

  getLoadParams() {
    let obj: any = {};
    if (this.SearchKey !== "") {
      obj["name"] = this.SearchKey;
    }
    if (this.filterValue) {
      obj[this.orderBy()] = this.filterValue;
    }
    obj["order"] = this.order();
    return obj;
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ["F2", "Escape", "Delete", "Enter"];

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
      this.SearchKey = "";
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

  grid_onInput() {
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

  onFilterDataChanged(event: any) {
    if (event.selectedItem) {
      this.filterValue = event.filterValue;
      this.orderBy.set(event.selectedItem.value);
      this.getData();
    }
  }
}
