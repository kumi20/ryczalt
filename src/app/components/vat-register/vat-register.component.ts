import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  signal,
  inject,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  computed,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { DxoGridModule } from 'devextreme-angular/ui/nested';
import { EventService } from '../../services/event-services.service';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  VatRegister,
  SummaryMonthVatRegiser,
} from '../../interface/vatRegister';
import { PriceFormatPipe } from '../../pipe/currency';
import { NewVatRegisterComponent } from './new-vat-register/new-vat-register.component';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { VatRegisterService } from '../../services/vatRegister.service';
import { FlateRateService } from '../../services/flateRate.services';
import { sign } from 'crypto';
import { NewFlateRateComponent } from '../flate-rate/new-flate-rate/new-flate-rate.component';
import {
  OpenCloseRequest,
  CheckIfMonthIsClosed,
} from '../../interface/flateRate';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { DateRangeComponent } from '../date-range/date-range.component';
import { GenericGridColumn, GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

@Component({
  selector: 'app-vat-register',
  standalone: true,
  imports: [
    DxButtonModule,
    DxoGridModule,
    DxTooltipModule,
    DxScrollViewModule,
    CommonModule,
    TranslateModule,
    DxDataGridModule,
    PriceFormatPipe,
    NewVatRegisterComponent,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    NewFlateRateComponent,
    DateRangeComponent,
    GenericDataGridComponent
  ],
  templateUrl: './vat-register.component.html',
  styleUrl: './vat-register.component.scss',
})
export class VatRegisterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('genericDataGrid') genericDataGrid: any;

  event = inject(EventService);
  cdr = inject(ChangeDetectorRef);
  vatRegisterService = inject(VatRegisterService);
  flateRateService = inject(FlateRateService);
  isClosed = signal<boolean>(false);
  mode: 'add' | 'edit' | 'show' = 'add';
  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = 'calc(100vh - 290px)';
  selectedRows: VatRegister[] = [];
  focusedRowIndex: number = 0;
  focusedElement = signal<VatRegister | null>(null);
  isAdd = signal<boolean>(false);
  pageSize: number = 50;
  isDelete = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];
  isConfirmDeleteFlateRate = signal<boolean>(false);
  ryczaltId: number | null = null;
  uri: string = 'registeVat/sell';
  paramsNumber: any;
  flatRegister: VatRegister | null = null;
  isAddFlateRegister = signal<boolean>(false);
  isNewFlateRegister = signal<boolean>(false);
  month = signal<number>(this.event.globalDate.month);
  year = signal<number>(this.event.globalDate.year);
  summaryMonthData: SummaryMonthVatRegiser = {
    TotalGrossSales: 0,
    Net23: 0,
    Vat23: 0,
    Net8: 0,
    Vat8: 0,
    Net5: 0,
    Vat5: 0,
    Net0: 0,
    Export0: 0,
    WDT0: 0,
    WSU: 0,
    ExemptSales: 0,
    ReverseCharge: 0,
    TotalNetSales: 0,
    TotalVat: 0,
  };

  private readonly translate = inject(TranslateService)
  private deviceTypeSubscription: Subscription | undefined;

   /** Opcje siatki klientów */
   options = computed(
    () =>
      ({
        height: "calc(100vh - 290px)",
      } as GenericGridOptions)
  );  

  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant('flateRate.documentNumber'),
          dataField: 'documentNumber',
          width: 200,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant('vatRegister.documentDate'),
          dataField: 'documentDate',
          width: 200,
          allowSorting: false,
          hidingPriority: 4, // Średni priorytet
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.datOFSell'),
          dataField: 'dateOfSell',
          width: 200,
          allowSorting: false,
          hidingPriority: 5, // Niski priorytet
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.customerName'),
          dataField: 'customerName',
          width: 300,
          allowSorting: false,
          hidingPriority: 2, // Wysoki priorytet
        },
        {
          caption: this.translate.instant('vatRegister.grossSalesValue'),
          dataField: 'grossSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 3, // Średni priorytet
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant('vatRegister.taxDue'),
          dataField: 'vatSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 6, // Najniższy priorytet
          customizeText: this.event.formatKwota,
        },
      ] as GenericGridColumn[]
  )

  constructor() {}

  ngOnInit() {
    this.getData();
    // Subskrybuj zmiany deviceType
    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
    });
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

  checkIfMonthIsClosed() {
    this.flateRateService
      .checkIfMonthIsClosed(this.month(), this.year())
      .subscribe({
        next: (data: CheckIfMonthIsClosed) => {
          this.isClosed.set(data.isClosed);
        },
        error: (error) => {
          this.event.httpErrorNotification(error);
        },
      });
  }

  getData() {
    this.checkIfMonthIsClosed();
    this.summaryMonth();
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'vatRegisterId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}${this.uri}`,
        loadParams: this.getLoadParams(),
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        onLoaded: (data) => {
          if (data.length > 0) this.focusedElement.set(data[0]);
          else this.focusedElement.set(null);
          setTimeout(() => {
            this.genericDataGrid.focus();
          }, 0);
        },
      }),
    });
  }

  getLoadParams() {
    let obj: any = {};
    obj.month = this.month();
    obj.year = this.year();
    return obj;
  }

  minusMonth() {
    if (this.month() > 1) {
      this.month.set(this.month() - 1);
    }
    this.getData();
  }

  plusMonth() {
    if (this.month() < 12) {
      this.month.set(this.month() + 1);
    }
    this.getData();
  }

  minusYear() {
    this.year.set(this.year() - 1);
    this.getData();
  }

  plusYear() {
    this.year.set(this.year() + 1);
    this.getData();
  }

  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  onRowDblClick(e: any) {
    // if (this.dropDownBoxMode()) {
    //   return;
    // }
    this.onEdit();
  }

  onEdit() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  addNewRecord() {
    this.mode = 'add';
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
  }

  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
  }

  onOpenClose() {
    const object: OpenCloseRequest = {
      month: this.month(),
      year: this.year(),
    };
    if (this.isClosed()) {
      this.flateRateService.openMonth(object).subscribe({
        next: () => {
          this.getData();
        },
        error: (error) => {
          this.event.httpErrorNotification(error);
        },
      });
      return;
    }

    this.flateRateService.closeMonth(object).subscribe({
      next: () => {
        this.getData();
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      this.summaryMonth();
      const index = data.findIndex(
        (x: any) =>
          x.vatRegisterId === Number(event.vatRegisterId.vatRegisterId)
      );

      if (event.mode === 'add' && this.uri === 'registeVat/sell') {
        this.paramsNumber = {
          number: event.data.documentNumber,
        };
        event.data.vatRegisterId = event.vatRegisterId.vatRegisterId;
        this.flatRegister = event.data;
        this.isAddFlateRegister.set(true);
      }

      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
      this.checkIfMonthIsClosed();
      this.cdr.detectChanges();
    });
  }

  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  delete() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().vatRegisterId;
    this.ryczaltId = this.getFocusedElement().ryczaltId;
    this.vatRegisterService.delete(id).subscribe({
      next: () => {
        if (this.ryczaltId != null && this.ryczaltId !== 0) {
          this.isConfirmDeleteFlateRate.set(true);
        }

        this.dataSource.reload().then(() => {
          this.focusedRowIndex = 0;
        });
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  yesAddFlateRegister() {
    this.isAddFlateRegister.set(false);
    this.isNewFlateRegister.set(true);
  }

  yesDeleteFlateRate() {
    this.isConfirmDeleteFlateRate.set(false);
    this.flateRateService.delete(this.ryczaltId as number).subscribe();
  }

  onSavingFlate() {
    this.isNewFlateRegister.set(false);
    this.dataSource.reload();
  }

  summaryMonth() {
    this.vatRegisterService.summaryMonth(this.month(), this.year()).subscribe({
      next: (data: SummaryMonthVatRegiser) => {
        this.summaryMonthData = data;
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  onDateRangeChange(event: {month: number, year: number}) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }

  // Mobile-specific methods
  getMobileDataItems(): any[] {
    if (this.dataSource && this.dataSource.items) {
      return this.dataSource.items() || [];
    }
    return [];
  }

  onMobileItemClick(item: any, index: number) {
    this.focusedElement.set(item);
    this.focusedRowIndex = index;
    this.onFocusedRowChanged({row: {data: item}});
  }

  ngOnDestroy() {
    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();
    }
  }
}
