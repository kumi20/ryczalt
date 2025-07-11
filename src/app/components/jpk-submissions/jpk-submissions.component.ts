import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppServices } from '../../services/app-services.service';
import { EventService } from '../../services/event-services.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { environment } from '../../../environments/environment';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import {
  DxDataGridModule,
  DxScrollViewModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomDropdownBoxComponent } from '../core/custom-dropdown-box/custom-dropdown-box.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { NgShortcutsComponent } from '../core/ng-keyboard-shortcuts/ng-keyboardng-keyboard-shortcuts.component';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { ICustomSearchItem, ICustomDropDownBoxValueChanged } from '../core/custom-dropdown-box/custom-dropdown-box.model';
import { GenericGridOptions } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericGridColumn } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';
import { JpkService } from '../../services/jpk.service';

/**
 * Component responsible for managing and displaying JPK (Jednolity Plik Kontrolny) submissions.
 * 
 * This component provides a comprehensive interface for viewing, managing, and navigating 
 * JPK submissions with features including:
 * - Grid-based display of submission data with sorting and filtering capabilities
 * - Year-based filtering for submissions
 * - Keyboard shortcuts for enhanced user experience
 * - Navigation to detailed JPK submission views
 * - Real-time data loading with DevExtreme data grid integration
 * 
 * @description The component uses Angular signals for reactive state management and implements
 * OnInit, AfterViewInit, and OnDestroy lifecycle hooks. It integrates with the JPK service
 * for data operations and provides a user-friendly interface for JPK submission management.
 * 
 * @dependencies
 * - AppServices: Core application services
 * - JpkService: JPK-specific data operations
 * - EventService: Event handling and data source management
 * - TranslateService: Internationalization support
 * - Router: Navigation between components
 * 
 * @since 1.0.0
 * @author Generated documentation
 */
@Component({
  selector: 'app-jpk-submissions',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TranslateModule,
    CustomDropdownBoxComponent,
    DxButtonModule,
    NgShortcutsComponent,
    DxTooltipModule,
    DxScrollViewModule,
    GenericDataGridComponent
  ],
  templateUrl: './jpk-submissions.component.html',
  styleUrl: './jpk-submissions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JpkSubmissionsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('genericDataGrid', { static: false }) genericDataGrid: any;

  dataSource: DataSource = new DataSource({});

  appServices = inject(AppServices);
  jpkService = inject(JpkService);
  event = inject(EventService);
  translate = inject(TranslateService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  selectedRows: any[] = [];
  focusedRowIndex: number = 0;

  orderBy = signal<string>('submissionDate');
  order = signal<string>('DESC');
  
  shortcuts: ShortcutInput[] = [];
  focusedElement = signal<any | null>(null);
  
  currentYear = signal<number>(new Date().getFullYear());
  years: ICustomSearchItem[] = [];

  /** Opcje siatki JPK */
  options = computed(
    () =>
      ({
        height: "calc(100vh - 150px)",
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
          caption: this.translate.instant('jpk.submissionId'),
          dataField: 'submissionId',
          width: 200,
          minWidth: 80,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 8,
        },
        {
          caption: this.translate.instant('jpk.jpkType'),
          dataField: 'jpkType',
          width: 150,
          minWidth: 120,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 2,
        },
        {
          caption: this.translate.instant('jpk.dateFrom'),
          dataField: 'dateFrom',
          width: 150,
          minWidth: 120,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 3,
        },
        {
          caption: this.translate.instant('jpk.dateTo'),
          dataField: 'dateTo',
          width: 150,
          minWidth: 150,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 1,
        },
        {
          caption: this.translate.instant('jpk.status'),
          dataField: 'status',
          width: 150,
          minWidth: 120,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 4,
        },     
        {
          caption: this.translate.instant('jpk.submittedAt'),
          dataField: 'submittedAt',
          width: 120,
          minWidth: 150,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 6,
          dataType: 'datetime',
          format: 'yyyy-MM-dd HH:mm:ss',
        },
        {
          caption: this.translate.instant('jpk.message'),
          dataField: 'message',
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 7,
        },
        {
          caption: this.translate.instant('jpk.details.statusDescription'),
          dataField: 'statusDescription',
          width: 200,
          minWidth: 150,
          allowSorting: false,
          hidingPriority: 5,
        },
        {
          caption: this.translate.instant('jpk.details.documentCount'),
          dataField: 'documentCount',
          width: 120,
          minWidth: 100,
          allowSorting: false,
          isAllowSorting: true,
          hidingPriority: 6,
          dataType: 'number',
        },
      ] as GenericGridColumn[]
  );

  /**
   * Constructor for JpkSubmissionsComponent.
   * 
   * @description Initializes the component and generates a list of years for the year filter.
   * Creates an array of the last 5 years including the current year for filtering submissions.
   * 
   * @since 1.0.0
   */
  constructor() {
    // Generowanie listy lat (ostatnie 5 lat)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.years.push({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString()
      });
    }
  }

  /**
   * Angular OnInit lifecycle hook.
   * 
   * @description Initializes the component by loading the initial data for JPK submissions.
   * This method is called once after the component is initialized.
   * 
   * @since 1.0.0
   */
  ngOnInit(): void {
    this.getData();
  }

  /**
   * Angular AfterViewInit lifecycle hook.
   * 
   * @description Sets up keyboard shortcuts and triggers change detection after view initialization.
   * Configures the F2 key to show detailed view of the currently focused JPK submission.
   * 
   * @since 1.0.0
   */
  ngAfterViewInit(): void {
    this.shortcuts = [
      {
        key: 'F2',
        preventDefault: true,
        allowIn: [AllowIn.Input, AllowIn.Textarea],
        command: () => {
          this.onShow();
        },
      },
    ];
    this.cdr.detectChanges();
  }

  /**
   * Initializes and configures the data source for JPK submissions.
   * 
   * @description Creates a new DevExtreme DataSource with AspNetData store configuration.
   * Sets up the data loading URL, parameters, error handling, and post-load actions.
   * Automatically focuses the data grid after data is loaded.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.getData(); // Refreshes the JPK submissions data
   * ```
   * 
   * @since 1.0.0
   */
  getData() {
    this.dataSource = new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}jpk/submissions-list`,
        loadParams: this.getLoadParams(),
        onAjaxError: this.event.onAjaxDataSourceError,
        onLoading(loadOptions: LoadOptions) {
          loadOptions.requireTotalCount = true;
        },
        onLoaded: () => {
          setTimeout(() => {
            this.genericDataGrid?.focus();
          }, 0);
        },
      }),
    });
  }

  /**
   * Generates load parameters for the data source.
   * 
   * @description Creates an object containing the current filter and sorting parameters
   * to be sent with the data request. Includes year filter, order by field, and sort order.
   * 
   * @returns {object} Object containing year, orderBy, and order parameters
   * 
   * @example
   * ```typescript
   * const params = this.getLoadParams();
   * // Returns: { year: 2024, orderBy: 'submissionDate', order: 'DESC' }
   * ```
   * 
   * @since 1.0.0
   */
  getLoadParams() {
    let obj: any = {};
    obj.year = this.currentYear();
    obj.orderBy = this.orderBy();
    obj.order = this.order();
    return obj;
  }

  /**
   * Handles year selection change in the year filter dropdown.
   * 
   * @description Updates the current year signal with the selected year value and refreshes the data.
   * Triggered when user selects a different year from the dropdown filter.
   * 
   * @param {ICustomDropDownBoxValueChanged} event - The dropdown change event containing selected item
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Event structure:
   * // { selectedItem: { value: '2023', label: '2023' } }
   * ```
   * 
   * @since 1.0.0
   */
  onYearChanged(event: ICustomDropDownBoxValueChanged) {
    this.currentYear.set(parseInt(event.selectedItem.value));
    this.getData();
  }

  /**
   * Handles row focus change events in the data grid.
   * 
   * @description Updates the focused element signal with the data from the currently focused row.
   * This allows other components and methods to access the currently selected JPK submission.
   * 
   * @param {any} event - The grid event object containing row information
   * @returns {void}
   * 
   * @since 1.0.0
   */
  onFocusedRowChanged(event: any) {
    this.focusedElement.set(event.row?.data);
  }

  /**
   * Shows the detailed view of the currently focused JPK submission.
   * 
   * @description Navigates to the JPK details page for the currently focused submission.
   * Validates that a valid JPK ID exists before navigation. This method is triggered
   * by the F2 keyboard shortcut or double-click events.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Triggered by F2 key or double-click
   * this.onShow(); // Navigates to /content/jpk-details/{id}
   * ```
   * 
   * @since 1.0.0
   */
  onShow() {
    const element = this.getFocusedElement();
    console.log('Focused element:', element);
    
    if (element && element.id) {
      console.log('JPK ID:', element.id);
      this.router.navigate(['/content/jpk-details', element.id]);
    } else {
      console.error('Nie znaleziono ID w danych JPK:', element);
    }
  }

  /**
   * Retrieves the data of the currently focused row in the data grid.
   * 
   * @description Returns the complete data object of the currently focused JPK submission.
   * Used internally by navigation and action methods to determine which submission to operate on.
   * 
   * @returns {any} The data object of the focused row, or undefined if no row is focused
   * 
   * @example
   * ```typescript
   * const focusedData = this.getFocusedElement();
   * if (focusedData?.id) {
   *   // Process the focused JPK submission
   * }
   * ```
   * 
   * @since 1.0.0
   */
  getFocusedElement() {
    return this.genericDataGrid?.getFocusedRowData();
  }

  /**
   * Handles double-click events on data grid rows.
   * 
   * @description Responds to double-click events by showing the detailed view of the clicked JPK submission.
   * Provides an alternative way to navigate to details besides the F2 keyboard shortcut.
   * 
   * @param {any} e - The double-click event object containing the row data
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Automatically called when user double-clicks a row
   * // Event structure: { data: { id: 123, submissionId: 'JPK-001', ... } }
   * ```
   * 
   * @since 1.0.0
   */
  onRowDblClick(e: any) {
    console.log('Row double click data:', e.data);
    this.onShow();
  }

  /**
   * Handles column header click events for sorting.
   * 
   * @description Updates the orderBy signal with the clicked column's field name.
   * This sets up the sorting field but does not immediately trigger data refresh.
   * 
   * @param {any} event - The column header click event containing the field name
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // When user clicks on 'submissionDate' column header
   * this.onColumnHeaderClick('submissionDate');
   * ```
   * 
   * @since 1.0.0
   */
  onColumnHeaderClick(event: any) {
    this.orderBy.set(event);
  }

  /**
   * Handles sort order change events.
   * 
   * @description Updates the sort order signal (ASC/DESC) and refreshes the data to apply the new sorting.
   * This method is typically called after a column header click to toggle the sort direction.
   * 
   * @param {any} event - The sort order value ('ASC' or 'DESC')
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.onOrderClick('ASC'); // Sorts in ascending order
   * this.onOrderClick('DESC'); // Sorts in descending order
   * ```
   * 
   * @since 1.0.0
   */
  onOrderClick(event: any) {
    this.order.set(event);
    this.getData();
  }

  /**
   * Refreshes the JPK submissions data.
   * 
   * @description Reloads the data source with current filter and sorting parameters.
   * This method can be called by user actions like refresh button clicks or programmatically
   * when data needs to be updated.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.onRefresh(); // Reloads all JPK submissions data
   * ```
   * 
   * @since 1.0.0
   */
  onRefresh() {
    this.getData();
  }

  /**
   * Angular OnDestroy lifecycle hook.
   * 
   * @description Cleanup method called when the component is destroyed.
   * Currently empty but available for future cleanup operations such as
   * unsubscribing from observables or clearing timers.
   * 
   * @returns {void}
   * 
   * @since 1.0.0
   */
  ngOnDestroy(): void {}
}