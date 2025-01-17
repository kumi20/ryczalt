import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FlateRateService } from '../../services/flateRate.services';
import { EventService } from '../../services/event-services.service';
import { CheckIfMonthIsClosed } from '../../interface/flateRate';
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';
import {
  OpenCloseRequest,
  FlateRate,
  SummaryMonth,
} from '../../interface/flateRate';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import { PriceFormatPipe } from '../../pipe/currency';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { error } from 'console';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { NewFlateRateComponent } from './new-flate-rate/new-flate-rate.component';
import { NewVatRegisterComponent } from '../vat-register/new-vat-register/new-vat-register.component';
import { VatRegisterService } from '../../services/vatRegister.service';
import { DateRangeComponent } from '../date-range/date-range.component';

@Component({
  selector: 'app-flate-rate',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    PriceFormatPipe,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    DxTooltipModule,
    NewFlateRateComponent,
    DxScrollViewModule,
    NewVatRegisterComponent,
    DateRangeComponent
  ],
  templateUrl: './flate-rate.component.html',
  styleUrl: './flate-rate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlateRateComponent implements OnInit, AfterViewInit {
  @ViewChild('dxGrid') dxGrid: any;

  flateRateService = inject(FlateRateService);
  event = inject(EventService);
  cdr = inject(ChangeDetectorRef);

  isClosed = signal<boolean>(false);
  mode: 'add' | 'edit' | 'show' = 'add';
  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = 'calc(100vh - 220px)';
  selectedRows: FlateRate[] = [];
  focusedRowIndex: number = 0;
  focusedElement = signal<FlateRate | null>(null);
  isAdd = signal<boolean>(false);
  pageSize: number = 50;
  isDelete = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];

  summaryMonthData: SummaryMonth = {
    sum_rate17: 0,
    sum_rate15: 0,
    sum_rate14: 0,
    sum_rate12_5: 0,
    sum_rate12: 0,
    sum_rate10: 0,
    sum_rate8_5: 0,
    sum_rate5_5: 0,
    sum_rate3: 0,
    total_sum: 0,
  };
  isAddVatRegister = signal<boolean>(false);
  paramsNumber: any;
  isNewVatRegister = signal<boolean>(false);
  vatRegisterFlate: FlateRate | null = null;
  isConfirmDeleteVatRegister = signal<boolean>(false);
  vatRegisterId: number | null = null;
  month = signal<number>(this.event.globalDate.month);
  year = signal<number>(this.event.globalDate.year);
  vatRegisterService = inject(VatRegisterService)

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

  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  summaryMonth() {
    this.flateRateService.summaryMonth(this.month(), this.year()).subscribe({
      next: (data: SummaryMonth) => {
        this.summaryMonthData = data;
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  getData() {
    this.checkIfMonthIsClosed();
    this.summaryMonth();
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'ryczaltId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}flateRate`,
        loadParams: this.getLoadParams(),
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        onLoaded: (data) => {
          if (data.length > 0) this.focusedElement.set(data[0]);
          else this.focusedElement.set(null);
          setTimeout(() => {
            this.event.setFocus(this.dxGrid);
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

  getFocusedElement() {
    return this.dxGrid.instance
      .getDataSource()
      .items()
      .find((_el: any, i: any) => this.focusedRowIndex === i);
  }

  addNewRecord() {
    this.mode = 'add';
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
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

  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
  }

  closeConfirm() {
    this.isDelete.set(false);
    this.event.setFocus(this.dxGrid);
  }

  delete() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().ryczaltId;
    this.vatRegisterId = this.getFocusedElement().vatRegisterId;

    this.flateRateService.delete(id).subscribe({
      next: () => {
        if(this.vatRegisterId != null){
          this.isConfirmDeleteVatRegister.set(true)
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

  yesAddVatRegister(){
    this.isAddVatRegister.set(false);
    this.isNewVatRegister.set(true);
  }

  onSavingVatRegister(e: any){
    this.isNewVatRegister.set(false);
    this.dataSource.reload();
  }

  yesDeleteVatRegister(){
    this.vatRegisterService.delete(this.vatRegisterId as number).subscribe();
  }

  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      const index = data.findIndex(
        (x: any) => x.ryczaltId === Number(event.flateRateId.flateRateId)
      );

      if(event.mode === 'add'){
        this.paramsNumber = {
          number: event.data.documentNumber
        }
        event.data.ryczaltId = event.flateRateId.flateRateId;
        this.vatRegisterFlate =  event.data;
        this.isAddVatRegister.set(true);
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

  onDateRangeChange(event: {month: number, year: number}) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }
}
