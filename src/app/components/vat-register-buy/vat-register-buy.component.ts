import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  signal,
  inject,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
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
import {
  VatRegisterBuy,
  VatPurchaseSummary,
} from '../../interface/vatRegister';
import { PriceFormatPipe } from '../../pipe/currency';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { VatRegisterService } from '../../services/vatRegister.service';
import { FlateRateService } from '../../services/flateRate.services';
import { sign } from 'crypto';
import {
  OpenCloseRequest,
  CheckIfMonthIsClosed,
} from '../../interface/flateRate';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { NewVatRegisterBuyComponent } from './new-vat-register-buy/new-vat-register-buy.component';
import { DateRangeComponent } from '../date-range/date-range.component';
import { GenericGridColumn, GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

@Component({
  selector: 'app-vat-register-buy',
  imports: [
    DxButtonModule,
    DxoGridModule,
    DxTooltipModule,
    DxScrollViewModule,
    CommonModule,
    TranslateModule,
    DxDataGridModule,
    PriceFormatPipe,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    NewVatRegisterBuyComponent,
    DateRangeComponent,
    GenericDataGridComponent
  ],
  templateUrl: './vat-register-buy.component.html',
  styleUrl: './vat-register-buy.component.scss',
})
export class VatRegisterBuyComponent implements OnInit, AfterViewInit {
  @ViewChild('genericDataGrid') genericDataGrid: any;

  event = inject(EventService);
  cdr = inject(ChangeDetectorRef);
  vatRegisterService = inject(VatRegisterService);
  flateRateService = inject(FlateRateService);
  isClosed = signal<boolean>(false);
  mode: 'add' | 'edit' | 'show' = 'add';
  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = 'calc(100vh - 290px)';
  uri: string = 'registeVat/buy';
  pageSize: number = 50;
  focusedElement = signal<VatRegisterBuy | null>(null);
  selectedRows: VatRegisterBuy[] = [];
  focusedRowIndex: number = 0;
  isAdd = signal<boolean>(false);
  isDelete = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];
  month = signal<number>(this.event.globalDate.month);
  year = signal<number>(this.event.globalDate.year);

  summaryMonthData: VatPurchaseSummary = {
    total_net_23: 0,
    total_vat_23: 0,
    total_net_8: 0,
    total_vat_8: 0,
    total_net_5: 0,
    total_vat_5: 0,
    total_zw_net_23: 0,
    total_zw_vat_23: 0,
    total_zw_net_8: 0,
    total_zw_vat_8: 0,
    total_zw_net_5: 0,
    total_zw_vat_5: 0,
    total_net: 0,
    total_net_not_deductible: 0,
    total_gross: 0,
    total_net_deductible: 0,
    total_vat_deductible: 0,
  };

  private readonly translate = inject(TranslateService)

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
          caption: this.translate.instant('vatRegister.nrInvoices'),
          dataField: 'documentNumber',
          width: 200,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('vatRegister.recivedDate'),
          dataField: 'dateOfSell',
          width: 200,
          allowSorting: false,
          hidingPriority: 7,
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.dateOfIssue'),
          dataField: 'documentDate',
          width: 300,
          allowSorting: false,
          hidingPriority: 6,
          dataType: 'date',
          format: { type: this.event.dateFormat },
          alignment: 'left',
        },
        {
          caption: this.translate.instant('vatRegister.customerName'),
          dataField: 'customerName',
          width: 300,
          allowSorting: false,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('vatRegister.gorssBuyValue'),
          dataField: 'grossSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 6,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant('vatRegister.deductibleVat'),
          dataField: 'vatSum',
          width: 200,
          allowSorting: false,
          hidingPriority: 6,
          customizeText: this.event.formatKwota,
        },
      ] as GenericGridColumn[]
  )

  constructor() {}

  ngOnInit(): void {
    this.getData();
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

  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
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

  addNewRecord() {
    this.mode = 'add';
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
  }

  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      this.summaryMonth();
      const index = data.findIndex(
        (x: any) =>
          x.vatRegisterId === Number(event.vatRegisterId.vatRegisterId)
      );
      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
      this.checkIfMonthIsClosed();
      this.cdr.detectChanges();
    });
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

  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
  }

  onRowDblClick(e: any) {
    this.onEdit();
  }

  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  delete() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().vatRegisterId;
    this.vatRegisterService.delete(id).subscribe({
      next: () => {
        this.dataSource.reload().then(() => {
          this.focusedRowIndex = 0;
        });
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
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

  summaryMonth() {
    this.vatRegisterService.summaryMonthBuy(this.month(), this.year()).subscribe({
      next: (data: VatPurchaseSummary) => {
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
}
