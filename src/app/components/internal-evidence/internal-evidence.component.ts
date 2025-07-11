import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from "devextreme-angular";

import { EventService } from "../../services/event-services.service";
import { DateRangeComponent } from "../date-range/date-range.component";
import DataSource from "devextreme/data/data_source";
import { InternalEvidence } from "../../interface/internalEvidence";
import { FlateRateService } from "../../services/flateRate.services";
import {
  CheckIfMonthIsClosed,
  OpenCloseRequest,
} from "../../interface/flateRate";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { environment } from "../../../environments/environment";
import { LoadOptions } from "devextreme/data";
import { NewInternalEvidenceComponent } from "./new-internal-evidence/new-internal-evidence.component";
import { NgShortcutsComponent } from "../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component";
import { AllowIn, ShortcutInput } from "ng-keyboard-shortcuts";
import { ConfirmDialogComponent } from "../core/confirm-dialog/confirm-dialog.component";
import { InternalEvidenceService } from "../../services/internal-evidence.service";
import { GenericGridColumn } from "../core/generic-data-grid/generic-data-grid.model";
import { GenericGridOptions } from "../core/generic-data-grid/generic-data-grid.model";
import { GenericDataGridComponent } from "../core/generic-data-grid/generic-data-grid.component";

/**
 * @fileoverview InternalEvidenceComponent manages internal evidence records (income and expense documents).
 * @description This component provides a comprehensive interface for managing internal evidence records,
 * including both income and expense documents. It supports month closure management, responsive design,
 * and full CRUD operations with proper validation.
 *
 * @component
 * @example
 * ```html
 * <app-internal-evidence></app-internal-evidence>
 * ```
 *
 * @dependencies
 * - EventService: For global event handling and session management
 * - InternalEvidenceService: For internal evidence CRUD operations
 * - FlateRateService: For month closure status management
 * - TranslateService: For internationalization support
 *
 * @features
 * - Internal evidence records management (income/expense documents)
 * - Month closure status tracking and control
 * - Generic data grid with responsive design
 * - Keyboard shortcuts for efficient navigation
 * - Date range filtering by month and year
 * - Document type distinction (income vs. expense)
 * - Mobile-responsive interface
 * - Confirm dialogs for safe operations
 *
 * @author Angular Team
 * @since 1.0.0
 */
@Component({
  selector: "app-internal-evidence",
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
    ConfirmDialogComponent,
    GenericDataGridComponent,
  ],
  templateUrl: "./internal-evidence.component.html",
  styleUrls: ["./internal-evidence.component.scss"],
})
export class InternalEvidenceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("genericDataGrid") genericDataGrid: any;

  event = inject(EventService);

  dataSource: DataSource = new DataSource({});
  heightGrid: number | string = "calc(100vh - 105px)";
  selectedRows: InternalEvidence[] = [];
  focusedRowIndex: number = 0;
  pageSize: number = 200;
  focusedElement = signal<InternalEvidence | null>(null);
  mode: "add" | "edit" | "show" = "add";
  isClosed = signal<boolean>(false);
  isAdd = signal<boolean>(false);

  month = signal<number>(this.event.globalDate.month);
  year = signal<number>(this.event.globalDate.year);
  cdr = inject(ChangeDetectorRef);
  isDelete = signal<boolean>(false);
  shortcuts: ShortcutInput[] = [];

  flateRateService = inject(FlateRateService);
  internalEvidenceService = inject(InternalEvidenceService);

  private readonly translate = inject(TranslateService);

  /** Opcje siatki klientów */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 105px)",
        columnHidingEnabled: true,
        columnChooser: {
          enabled: true,
          mode: 'select',
          searchEnabled: true,
          sortOrder: 'asc',
        },
      } as GenericGridOptions)
  );

  columns = computed(
    () =>
      [
        {
          caption: this.translate.instant(
            "internalEvidence.kindOfInternalEvidence"
          ),
          dataField: "isCoast",
          width: 230,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 3, // Średni priorytet
          dataType: "string",
          customizeText: (e: any) => {
            return e.value
              ? this.translate.instant("internalEvidence.expense")
              : this.translate.instant("internalEvidence.income");
          },
        },
        {
          caption: this.translate.instant(
            "internalEvidence.numberOfInternalEvidence"
          ),
          dataField: "documentNumber",
          width: 230,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 1, // Najwyższy priorytet
        },
        {
          caption: this.translate.instant("internalEvidence.dateOfIssue"),
          dataField: "documentDate",
          width: 150,
          minWidth: 120,
          dataType: "date",
          format: { type: this.event.dateFormat },
          alignment: "left",
          hidingPriority: 1, // Najwyższy priorytet - zawsze widoczny
        },
        {
          caption: this.translate.instant("internalEvidence.value"),
          dataField: "amount",
          width: 100,
          minWidth: 80,
          allowSorting: false,
          hidingPriority: 2, // Wysoki priorytet
        },
        {
          caption: this.translate.instant("internalEvidence.personIssuing"),
          dataField: "personIssuing",
          width: 200,
          minWidth: 120,
          allowSorting: false,
          hidingPriority: 5, // Niski priorytet
        },
        {
          caption: this.translate.instant(
            "internalEvidence.purposeOfExpenditure"
          ),
          dataField: "description",
          minWidth: 200,
          allowSorting: false,
          hidingPriority: 6, // Najniższy priorytet
        },
      ] as GenericGridColumn[]
  );

  /**
   * Initializes the component by loading internal evidence data.
   * Called once after component initialization.
   * @lifecycle OnInit
   */
  ngOnInit() {
    this.getData();
  }

  /**
   * Sets up keyboard shortcuts after view initialization.
   * Defines shortcuts for adding (Alt+N), editing (F2), viewing (Shift+F2), and deleting (Del) records.
   * @lifecycle AfterViewInit
   */
  ngAfterViewInit() {
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

  /**
   * Initializes and configures the data source for internal evidence records.
   * Checks month closure status and sets up the AspNetData store with appropriate endpoints.
   * Automatically focuses on the first row after data loading.
   * @private
   */
  getData() {
    this.checkIfMonthIsClosed();
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: "internalEvidenceId",
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
            this.genericDataGrid.focus();
          }, 0);
        },
      }),
    });
  }

  /**
   * Constructs the load parameters for the internal evidence data source.
   * Includes the selected month and year for filtering.
   * @returns An object containing the load parameters
   * @private
   */
  getLoadParams() {
    let obj: any = {};
    obj.month = this.month();
    obj.year = this.year();
    return obj;
  }

  /**
   * Closes the delete confirmation dialog and returns focus to the data grid.
   * @public
   */
  closeConfirm() {
    this.isDelete.set(false);
    this.genericDataGrid.focus();
  }

  /**
   * Checks if the current month is closed for editing.
   * Updates the isClosed signal based on the server response.
   * @private
   */
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

  /**
   * Handles date range changes from the date range component.
   * Updates the month and year signals and refreshes the data grid.
   * @param event - The date range change event
   * @param event.month - The selected month (1-12)
   * @param event.year - The selected year
   * @public
   */
  onDateRangeChange(event: any) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getData();
  }

  /**
   * Handles data grid row focus changes.
   * Updates the focused element signal with the selected row data.
   * @param event - The row focus change event containing row data
   * @public
   */
  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row.data);
  }

  /**
   * Handles key down events on the data grid.
   * Prevents default behavior for specific keys to avoid conflicts.
   * @param event - The key down event
   * @public
   */
  onKeyDown(event: any) {
    const BLOCKED_KEYS = ["F2", "Escape", "Delete", "Enter"];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  /**
   * Handles double-click events on data grid rows.
   * Triggers the edit action for the double-clicked row.
   * @param event - The double-click event
   * @public
   */
  onRowDblClick(event: any) {
    this.onEdit();
  }

  /**
   * Initiates the process of editing the currently focused internal evidence record.
   * Validates session activity and month closure status before proceeding.
   * @public
   */
  onEdit() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.mode = "edit";
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Retrieves the currently focused row data from the data grid.
   * @returns The focused row data
   * @private
   */
  getFocusedElement() {
    return this.genericDataGrid.getFocusedRowData();
  }

  /**
   * Toggles the open/close status of the current month.
   * If month is closed, opens it; if open, closes it.
   * Refreshes data after successful operation.
   * @public
   */
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

  /**
   * Initiates the process of adding a new internal evidence record.
   * Validates session activity and month closure status before proceeding.
   * @public
   */
  addNewRecord() {
    this.mode = "add";
    if (!this.event.sessionData.isActive || this.isClosed()) return;

    this.isAdd.set(true);
  }

  /**
   * Shows the delete confirmation dialog for the currently focused internal evidence record.
   * Validates session activity and month closure status before proceeding.
   * @public
   */
  onDeleteConfirm() {
    if (!this.event.sessionData.isActive || this.isClosed()) return;
    this.isDelete.set(true);
  }

  /**
   * Initiates the process of viewing the currently focused internal evidence record in read-only mode.
   * @public
   */
  onShow() {
    this.mode = "show";
    this.focusedElement.set(this.getFocusedElement());
    this.isAdd.set(true);
  }

  /**
   * Handles the saving event from the add/edit dialog.
   * Reloads the data source, focuses on the saved record, and updates month closure status.
   * @param event - The save event containing the record ID
   * @param event.internalEvidenceId - The internal evidence ID object
   * @public
   */
  onSaving(event: any) {
    this.isAdd.set(false);
    this.dataSource.reload().then((data) => {
      const index = data.findIndex(
        (x: any) =>
          x.internalEvidenceId ===
          Number(event.internalEvidenceId.internalEvidenceId)
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

  /**
   * Deletes the currently focused internal evidence record.
   * Validates session activity and month closure status before proceeding.
   * Reloads the data source after successful deletion.
   * @public
   */
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


  /**
   * Returns the localized label for the evidence type based on the isCoast flag.
   * @param isCoast - True for expense, false for income
   * @returns The localized label for the evidence type
   * @example
   * ```typescript
   * const label = this.getEvidenceTypeLabel(true); // returns "Expense"
   * const label = this.getEvidenceTypeLabel(false); // returns "Income"
   * ```
   */
  getEvidenceTypeLabel(isCoast: boolean): string {
    return isCoast 
      ? this.translate.instant("internalEvidence.expense")
      : this.translate.instant("internalEvidence.income");
  }

  /**
   * Cleans up resources when the component is destroyed.
   * Currently no cleanup is required but method is implemented for future use.
   * @lifecycle OnDestroy
   */
  ngOnDestroy() {}

}
