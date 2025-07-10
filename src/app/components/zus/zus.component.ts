import {
  Component,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from "devextreme-angular";
import { EventService } from "../../services/event-services.service";
import { ZusService } from "../../services/zus.service";
import DataSource from "devextreme/data/data_source";
import { ConfirmDialogComponent } from "../core/confirm-dialog/confirm-dialog.component";
import { NgShortcutsComponent } from "../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component";
import { AllowIn, ShortcutInput } from "ng-keyboard-shortcuts";
import { PriceFormatPipe } from "../../pipes/price-format.pipe";
import { ContributionsZUS } from "../../interface/zus";
import { AddZusComponent } from "./add-zus/add-zus.component";
import { DateRangeComponent } from "../date-range/date-range.component";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import {
  GenericGridColumn,
  GenericGridOptions,
} from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";

@Component({
  selector: "app-zus",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    DxScrollViewModule,
    DxTooltipModule,
    ConfirmDialogComponent,
    NgShortcutsComponent,
    PriceFormatPipe,
    AddZusComponent,
    DateRangeComponent,
    GenericDataGridComponent,
  ],
  templateUrl: "./zus.component.html",
  styleUrls: ["./zus.component.scss"],
})
export class ZusComponent implements OnInit {
  @ViewChild("genericDataGrid") genericDataGrid: any;

  event = inject(EventService);
  translate = inject(TranslateService);
  zusService = inject(ZusService);
  Number = Number;

  dataSource: any;
  focusedRowIndex = 0;
  pageSize = 20;
  heightGrid = "calc(100vh - 105px)";
  shortcuts: ShortcutInput[] = [];

  isDelete = signal<boolean>(false);
  isAdd = signal<boolean>(false);
  mode: "add" | "edit" | "show" = "add";
  focusedElement = signal<any>(null);
  month = signal<number>(new Date().getMonth() + 1);
  year = signal<number>(new Date().getFullYear());
  isClosed = signal<boolean>(false);

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
          minWidth: 90,
          hidingPriority: 2,
          cellTemplate: (e: any) => {
            return (
              e.data.year +
              "-" +
              e.data.month.toString().padStart(2, "0") +
              "-01"
            );
          },
        },
        {
          caption: this.translate.instant("zus.periodTo"),
          dataField: "year",
          width: 110,
          minWidth: 90,
          hidingPriority: 3,
          cellTemplate: (e: any) => {
            return (
              e.data.year +
              "-" +
              e.data.month.toString().padStart(2, "0") +
              "-" +
              this.getLastDayOfMonth(e.data.year, e.data.month)
            );
          },
        },
        {
          caption: this.translate.instant("zus.healthInsurance"),
          dataField: "contributionHealth",
          width: 250,
          minWidth: 120,
          hidingPriority: 4,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.socialInsurance"),
          dataField: "social",
          width: 250,
          minWidth: 120,
          hidingPriority: 5,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.laborFund"),
          dataField: "fpfgsw",
          width: 250,
          minWidth: 120,
          hidingPriority: 6,
          customizeText: this.event.formatKwota,
        },
        {
          caption: this.translate.instant("zus.totalZus"),
          dataField: "isContributionHolidays",
          width: 250,
          minWidth: 120,
          hidingPriority: 1,
          cellTemplate: (e: any) => {
            return this.event.formatKwota({
              value:
                Number(e.data.contributionHealth || 0) +
                Number(e.data.social || 0) +
                Number(e.data.fpfgsw || 0),
            });
          },
        },
      ] as GenericGridColumn[]
  );

  ngOnInit(): void {
    this.initShortcuts();
    this.getData();
  }

  initShortcuts() {
    this.shortcuts.push(
      {
        key: ["alt + n"],
        label: "Add",
        description: "Add new ZUS entry",
        command: () => this.addNewRecord(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      },
      {
        key: ["f2"],
        label: "Edit",
        description: "Edit ZUS entry",
        command: () => this.onEdit(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      },
      {
        key: ["shift + f2"],
        label: "Show",
        description: "Show ZUS entry",
        command: () => this.onShow(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      },
      {
        key: ["del"],
        label: "Delete",
        description: "Delete ZUS entry",
        command: () => this.onDeleteConfirm(),
        preventDefault: true,
        allowIn: [AllowIn.Textarea, AllowIn.Input],
      }
    );
  }

  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: "contributionsZUSId",
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}zus/contributions`,
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

  onDateRangeChange(event: { month: number; year: number }) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }

  onFocusedRowChanged(e: any) {
    this.focusedElement.set(e.row.data);
  }

  addNewRecord() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.mode = "add";
    this.isAdd.set(true);
  }

  onEdit() {
    if (!this.event.sessionData.isActive) return;
    this.mode = "edit";
    this.isAdd.set(true);
  }

  onShow() {
    this.mode = "show";
    this.isAdd.set(true);
  }

  onDeleteConfirm() {
    if (!this.event.sessionData.isActive) return;
    this.isDelete.set(true);
  }

  delete() {
    if (!this.event.sessionData.isActive) return;

    const id = this.focusedElement()?.contributionsZUSId;
    if (!id) return;

    this.zusService.delete(id).subscribe({
      next: () => {
        this.getData();
        this.isDelete.set(false);
      },
      error: (err) => {
        this.event.httpErrorNotification(err);
      },
    });
  }

  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  onSaving(event: any) {
    this.dataSource.reload().then((data: ContributionsZUS[]) => {
      const index = data.findIndex(
        (x: any) => x.contributionsZUSId == event.id
      );

      if (index !== -1) {
        this.focusedRowIndex = index;
      } else {
        this.focusedRowIndex = 0;
      }
    });
    this.isAdd.set(false);
  }

  getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  onRowDblClick(event: any) {
    this.onEdit();
  }

  onClosing() {
    this.isAdd.set(false);
    this.genericDataGrid.focus();
  }
}
