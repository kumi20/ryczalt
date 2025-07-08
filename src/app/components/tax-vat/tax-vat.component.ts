import {
  Component,
  inject,
  signal,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  HostListener,
  computed,
} from "@angular/core";
import { DxScrollViewModule } from "devextreme-angular";
import { DxButtonModule } from "devextreme-angular";
import { DxDataGridModule } from "devextreme-angular";
import { DateRangeComponent } from "../date-range/date-range.component";
import { ZusService } from "../../services/zus.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { EventService } from "../../services/event-services.service";
import { PriceFormatPipe } from "../../pipes/price-format.pipe";

import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import DataSource from "devextreme/data/data_source";
import { TaxVat } from "../../interface/tax-vat";
import { CommonModule } from "@angular/common";
import { ShortcutInput, AllowIn } from "ng-keyboard-shortcuts";
import { ConfirmDialogComponent } from "../core/confirm-dialog/confirm-dialog.component";
import { NgShortcutsComponent } from "../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component";
import { TaxVatService } from "../../services/tax-vat.services";
import { AddTaxVatComponent } from "./add-tax-vat/add-tax-vat.component";
import {
  GenericGridColumn,
  GenericGridOptions,
} from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";

@Component({
  selector: "app-tax-vat",
  imports: [
    DxScrollViewModule,
    DxButtonModule,
    DxDataGridModule,
    DateRangeComponent,
    TranslateModule,
    CommonModule,
    PriceFormatPipe,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    AddTaxVatComponent,
    GenericDataGridComponent,
  ],
  templateUrl: "./tax-vat.component.html",
  styleUrl: "./tax-vat.component.scss",
})
export class TaxVatComponent implements OnInit, AfterViewInit {
  @ViewChild("genericDataGrid") genericDataGrid: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  zusService = inject(ZusService);

  month = signal<number>(new Date().getMonth() + 1);
  year = signal<number>(new Date().getFullYear());

  isDelete = signal<boolean>(false);
  isAdd = signal<boolean>(false);
  mode: "add" | "edit" | "show" = "add";
  focusedElement = signal<any>(null);
  dataSource: any;
  heightGrid = "calc(100vh - 105px)";
  focusedRowIndex: number = 0;
  pageSize = 20;
  shortcuts: ShortcutInput[] = [];
  cdr = inject(ChangeDetectorRef);
  taxVatService = inject(TaxVatService);

  /** Opcje siatki klientów */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 105px)",
      } as GenericGridOptions)
  );

  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant("zus.periodFrom"),
          dataField: "month",
          width: 110,
          cellTemplate: (e: any) => {
            return (
              e.data.ROK +
              "-" +
              e.data.MIESIAC.toString().padStart(2, "0") +
              "-01"
            );
          },
        },
        {
          caption: this.translate.instant("zus.periodTo"),
          dataField: "year",
          width: 110,
          cellTemplate: (e: any) => {
            return e.data.ROK + "-" + e.data.MIESIAC.toString().padStart(2, "0") + "-" + this.getLastDayOfMonth(e.data.ROK, e.data.MIESIAC);
          },
        },
        {
          caption: this.translate.instant("taxVat.taxAmount"),
          dataField: "KWOTA",
          width: 110,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("taxVat.taxExcess"),
          dataField: "NADWYZKA",
          width: 110,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.paymentDate"),
          dataField: "DATA_WPLATY",
          width: 110,
          dataType: "date",
          format: { type: this.event.dateFormat },
          alignment: "left",
        },
        {
          caption: this.translate.instant("zus.isPaid"),
          dataField: "ZAPLACONY",
          width: 110,
          encodeHtml: false,
          dataType: "string",
          cellTemplate: (e: any) => {
            return e.data.ZAPLACONY ? "<img src='../../../assets/images/check-solid.svg' alt='' width='14' />" : "";
          },
        },
      ] as GenericGridColumn[]
  );

  toNumber(value: any): number {
    return Number(value || 0);
  }

  ngOnInit(): void {
    this.getData();
  }

  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: "alt + n",
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: () => {
          this.addNewRecord();
        },
      },
      {
        key: "F2",
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: (data) => {
          if (data.event.shiftKey) this.onShow();
          if (!data.event.shiftKey) this.onEdit();
        },
      },

      {
        key: "del",
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
    this.mode = "add";
    this.isAdd.set(true);
  }

  onEdit() {
    this.mode = "edit";
    this.isAdd.set(true);
  }

  onShow() {
    this.mode = "show";
    this.isAdd.set(true);
  }

  onDateRangeChange(event: { month: number; year: number }) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }

  onDeleteConfirm() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(true);
  }

  getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  onFocusedRowChanged(e: any) {
    this.focusedElement.set(e.row.data);
  }

  onRowDblClick(event: any) {
    this.onEdit();
  }

  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: "ID_PODATEK_VAT",
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}tax-vat`,
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
    obj.year = this.event.globalDate.year;
    return obj;
  }

  delete() {
    if (!this.event.sessionData.isActive) return;

    const id = this.focusedElement()?.ID_PODATEK_VAT;
    if (!id) return;

    this.taxVatService.delete(id).subscribe({
      next: () => {
        this.getData();
        this.isDelete.set(false);
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  onSaving(event: any) {
    this.dataSource.reload().then((data: TaxVat[]) => {
      const index = data.findIndex(
        (x: any) => x.ID_PODATEK_VAT == Number(event.id)
      );

      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
    });
    this.isAdd.set(false);
  }

  onClosing() {
    this.isAdd.set(false);
    this.genericDataGrid.focus();
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    this.onClosing();
  }
}
