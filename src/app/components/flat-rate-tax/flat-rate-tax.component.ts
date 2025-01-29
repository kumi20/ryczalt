import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DxButtonModule, DxDataGridModule, DxScrollViewModule } from 'devextreme-angular';
import { EventService } from '../../services/event-services.service';
import { AllowIn, KeyboardShortcutsComponent, ShortcutInput } from 'ng-keyboard-shortcuts';

import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import { FlatRateTax } from '../../interface/flatRateTax';
import { CommonModule } from '@angular/common';
import { DateRangeComponent } from '../date-range/date-range.component';
import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { NewFlatRateTaxComponent } from './new-flat-rate-tax/new-flat-rate-tax.component';
import { FlatRateTaxService } from '../../services/flat-rate-tax.service';

@Component({
  selector: 'app-flat-rate-tax',
  imports: [
    DxDataGridModule,
    DxScrollViewModule,
    DxButtonModule,
    TranslateModule,
    CommonModule,
    DateRangeComponent,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    NewFlatRateTaxComponent,
  ],
  templateUrl: './flat-rate-tax.component.html',
  styleUrl: './flat-rate-tax.component.scss',
})
export class FlatRateTaxComponent implements OnInit, AfterViewInit {
  @ViewChild('dxGrid') dxGrid: any;
  translate = inject(TranslateService);
  event = inject(EventService);
  flatRateTaxService = inject(FlatRateTaxService);

  cdr = inject(ChangeDetectorRef);
  shortcuts: ShortcutInput[] = [];

  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = 'calc(100vh - 220px)';
  focusedElement = signal<FlatRateTax | null>(null);
  year = signal<number>(this.event.globalDate.year);
  focusedRowIndex: number = 0;
  pageSize: number = 30;

  mode: 'add' | 'edit' | 'show' = 'add';
  isAdd = signal<boolean>(false);
  isDelete = signal<boolean>(false);

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

  addNewRecord() {
    this.mode = 'add';
    this.isAdd.set(true);
  }

  onEdit() {
    this.mode = 'edit';
    this.isAdd.set(true);
  }

  onDeleteConfirm() {
    this.isDelete.set(true);
  }

  onShow() {
    this.mode = 'show';
    this.isAdd.set(true);
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'flatRateTaxId',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}flat-rate-tax`,
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
    obj.year = this.year();
    return obj;
  }

  getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  onRowDblClick(e: any) {
    this.onEdit();
  }

  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  onDateRangeChange(event: { month: number; year: number }) {
    this.year.set(event.year);
    this.getData();
  }

  onSaving(event: any) {
    this.dataSource.reload().then((data: FlatRateTax[]) => {
      const index = data.findIndex(
        (x: any) => x.flatRateTaxId == event.id
      );

      if(index !== -1){
        this.focusedRowIndex = index;
      }
      else{
        this.focusedRowIndex = 0;
      }
    });
    this.isAdd.set(false);
  }

  delete() {
    if (!this.event.sessionData.isActive) return;

    const id = this.focusedElement()?.flatRateTaxId;
    if (!id) return;

    this.flatRateTaxService.delete(id).subscribe({
      next: () => {
        this.getData();
        this.isDelete.set(false);
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      }
    });
  }
}
