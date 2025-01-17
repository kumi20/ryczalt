import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';

import { EventService } from '../../services/event-services.service';
import { DateRangeComponent } from '../date-range/date-range.component';
import DataSource from 'devextreme/data/data_source';
import { InternalEvidence } from '../../interface/internalEvidence';
import { FlateRateService } from '../../services/flateRate.services';
import { CheckIfMonthIsClosed, OpenCloseRequest } from '../../interface/flateRate';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import { NewInternalEvidenceComponent } from './new-internal-evidence/new-internal-evidence.component';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { InternalEvidenceService } from '../../services/internal-evidence.service';

@Component({
  selector: 'app-internal-evidence',
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    DxScrollViewModule,
    DxTooltipModule,
    DateRangeComponent,
    NewInternalEvidenceComponent,
    NgShortcutsComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './internal-evidence.component.html',
  styleUrls: ['./internal-evidence.component.scss']
})
export class InternalEvidenceComponent implements OnInit, AfterViewInit {
  @ViewChild('dxGrid') dxGrid: any;
  
  event = inject(EventService);

  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = 'calc(100vh - 220px)';
  selectedRows: InternalEvidence[] = [];
  focusedRowIndex: number = 0;
  pageSize: number = 200;
  focusedElement = signal<InternalEvidence | null>(null);
  mode: 'add' | 'edit' | 'show' = 'add';
  isClosed = signal<boolean>(false);
  isAdd = signal<boolean>(false);

  month = signal<number>(this.event.globalDate.month);
  year = signal<number>(this.event.globalDate.year);
  cdr = inject(ChangeDetectorRef);
  isDelete = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];
  
  flateRateService = inject(FlateRateService);
  internalEvidenceService = inject(InternalEvidenceService);

  ngOnInit() {}

  ngAfterViewInit() {
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
    this.checkIfMonthIsClosed();
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'internalEvidenceId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}internalEvidence`,
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

  
  closeConfirm() {
    this.isDelete.set(false);
    this.event.setFocus(this.dxGrid);
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

  onDateRangeChange(event: any) {
    this.month.set(event.month);
    this.year.set(event.year);
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

  onRowDblClick(event: any) {
    this.onEdit();
  }

  onEdit() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.mode = 'edit';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  getFocusedElement() {
    return this.dxGrid.instance
      .getDataSource()
      .items()
      .find((_el: any, i: any) => this.focusedRowIndex === i);
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
  
  addNewRecord() {
    this.mode = 'add';
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
  }

  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
  }

  onShow() {
    this.mode = 'show';
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }


  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      const index = data.findIndex(
        (x: any) => x.internalEvidenceId === Number(event.internalEvidenceId)
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

  
  delete() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(false);

    const id = this.getFocusedElement().internalEvidenceId;
  
    this.internalEvidenceService.delete(id).subscribe({
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
} 