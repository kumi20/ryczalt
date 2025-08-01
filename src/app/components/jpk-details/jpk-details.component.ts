import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxScrollViewModule,
  DxTabsModule,
  DxTooltipModule,
  DxLoadPanelModule,
} from 'devextreme-angular';
import { Subscription } from 'rxjs';
import { JpkService } from '../../services/jpk.service';
import { JpkDetails } from '../../interface/jpk';
import { GenericGridOptions, GenericGridColumn } from '../core/generic-data-grid/generic-data-grid.model';
import { GenericDataGridComponent } from '../core/generic-data-grid/generic-data-grid.component';

/**
 * Component for displaying detailed information about a specific JPK (Jednolity Plik Kontrolny) submission.
 * 
 * This component provides a comprehensive view of a single JPK submission with multiple tabs displaying:
 * - Overview: Basic submission information and status
 * - Sales Documents: Grid view of all sales documents included in the submission
 * - Purchase Documents: Grid view of all purchase documents included in the submission
 * - Summary: Statistical and summary information about the submission
 * 
 * @description The component uses Angular signals for reactive state management and implements
 * tabbed navigation for different data views. It fetches detailed JPK data including related
 * documents and provides download functionality for the XML file.
 * 
 * Features:
 * - Reactive data loading with loading states
 * - Tabbed interface for organized data presentation
 * - Grid-based document viewing with sorting and filtering
 * - Download functionality for JPK XML files
 * - Navigation back to submissions list
 * - Responsive design with DevExtreme UI components
 * 
 * @dependencies
 * - JpkService: JPK-specific data operations and API calls
 * - TranslateService: Internationalization support
 * - ActivatedRoute: Route parameter access for JPK ID
 * - Router: Navigation functionality
 * 
 * @since 1.0.0
 * @author Generated documentation
 */
@Component({
  selector: 'app-jpk-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    DxScrollViewModule,
    DxTabsModule,
    DxTooltipModule,
    DxLoadPanelModule,
    GenericDataGridComponent,
  ],
  templateUrl: './jpk-details.component.html',
  styleUrl: './jpk-details.component.scss',
})
export class JpkDetailsComponent implements OnInit, OnDestroy {
  /**
   * Injected activated route service for accessing route parameters
   * @type {ActivatedRoute}
   * @description Provides access to route parameters, particularly the JPK ID
   * @private
   * @since 1.0.0
   */
  private route = inject(ActivatedRoute);
  
  /**
   * Injected router service for navigation
   * @type {Router}
   * @description Provides navigation capabilities for routing between components
   * @private
   * @since 1.0.0
   */
  private router = inject(Router);
  
  /**
   * Injected JPK service for JPK-specific operations
   * @type {JpkService}
   * @description Manages JPK data operations including fetching details and downloads
   * @private
   * @since 1.0.0
   */
  private jpkService = inject(JpkService);
  
  /**
   * Injected translation service for internationalization
   * @type {TranslateService}
   * @description Provides translation capabilities for component labels and messages
   * @private
   * @since 1.0.0
   */
  private translate = inject(TranslateService);
  
  /**
   * Injected change detector reference for manual change detection
   * @type {ChangeDetectorRef}
   * @description Enables manual triggering of change detection cycles
   * @private
   * @since 1.0.0
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * Input signal for the JPK ID to display details for
   * @type {InputSignal<number | null>}
   * @description JPK submission ID passed from parent component or route
   * @default null
   * @since 1.0.0
   */
  jpkId = input<number | null>(null);
  
  /**
   * Signal containing the detailed JPK submission data
   * @type {Signal<JpkDetails | null>}
   * @description Stores the complete JPK submission details including documents
   * @default null
   * @since 1.0.0
   */
  jpkDetails = signal<JpkDetails | null>(null);
  
  /**
   * Signal indicating whether data is currently being loaded
   * @type {Signal<boolean>}
   * @description Controls loading state indicators in the UI
   * @default false
   * @since 1.0.0
   */
  isLoading = signal<boolean>(false);
  
  /**
   * Signal containing the currently selected tab index
   * @type {Signal<number>}
   * @description Tracks which tab is currently active in the details view
   * @default 0
   * @since 1.0.0
   */
  selectedTabIndex = signal<number>(0);

  /**
   * Subscription for managing component lifecycle and cleanup
   * @type {Subscription | undefined}
   * @description Manages observable subscriptions for proper cleanup
   * @private
   * @since 1.0.0
   */
  private subscription?: Subscription;

  /**
   * Computed tabs configuration for the detail view
   * @type {ComputedSignal<Array<{id: number, text: string, icon: string}>>}
   * @description Provides tab configuration with localized labels and icons
   * @since 1.0.0
   */
  tabs = computed(() => [
    {
      id: 0,
      text: this.translate.instant('jpk.details.overview'),
      icon: 'info',
    },
    {
      id: 1,
      text: this.translate.instant('jpk.details.salesDocuments'),
      icon: 'export',
    },
    {
      id: 2,
      text: this.translate.instant('jpk.details.purchaseDocuments'),
      icon: 'import',
    },
    {
      id: 3,
      text: this.translate.instant('jpk.details.summary'),
      icon: 'chart',
    },
  ]);

  /**
   * Computed options for the sales documents data grid configuration
   * @type {ComputedSignal<GenericGridOptions>}
   * @description Provides configuration options for the sales documents grid
   * @since 1.0.0
   */
  salesGridOptions = computed(
    () =>
      ({
        height: "calc(100vh - 300px)",
        columnHidingEnabled: true,
        columnChooser: {
          enabled: true,
          mode: 'select',
          searchEnabled: true,
          sortOrder: 'asc',
        },
      } as GenericGridOptions)
  );

  /**
   * Computed columns configuration for the sales documents grid
   * @type {ComputedSignal<GenericGridColumn[]>}
   * @description Defines column structure and formatting for the sales documents grid
   * @since 1.0.0
   */
  salesColumns = computed(
    () =>
      [
        {
          caption: this.translate.instant('jpk.details.documentNumber'),
          dataField: 'documentNumber',
          width: 150,
          minWidth: 120,
          allowSorting: true,
          hidingPriority: 1,
        },
        {
          caption: this.translate.instant('jpk.details.customerName'),
          dataField: 'customerName',
          width: 200,
          minWidth: 150,
          allowSorting: true,
          hidingPriority: 2,
        },
        {
          caption: this.translate.instant('jpk.details.customerNip'),
          dataField: 'customerNip',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('jpk.details.documentDate'),
          dataField: 'documentDate',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 3,
          dataType: 'date',
          format: 'dd.MM.yyyy',
        },
        {
          caption: this.translate.instant('jpk.details.saleDate'),
          dataField: 'saleDate',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 4,
          dataType: 'date',
          format: 'dd.MM.yyyy',
        },
        {
          caption: this.translate.instant('jpk.details.netAmount'),
          dataField: 'netAmount',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 5,
          dataType: 'number',
          format: 'fixedPoint',
        },
        {
          caption: this.translate.instant('jpk.details.vatAmount'),
          dataField: 'vatAmount',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 7,
          dataType: 'number',
          format: 'fixedPoint',
        },
      ] as GenericGridColumn[]
  );

  // Kolumny dla dokumentów zakupu
  purchaseColumns = computed(
    () =>
      [
        {
          caption: this.translate.instant('jpk.details.documentNumber'),
          dataField: 'documentNumber',
          width: 150,
          minWidth: 120,
          allowSorting: true,
          hidingPriority: 1,
        },
        {
          caption: this.translate.instant('jpk.details.customerName'),
          dataField: 'customerName',
          width: 200,
          minWidth: 150,
          allowSorting: true,
          hidingPriority: 2,
        },
        {
          caption: this.translate.instant('jpk.details.customerNip'),
          dataField: 'customerNip',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 6,
        },
        {
          caption: this.translate.instant('jpk.details.documentDate'),
          dataField: 'documentDate',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 3,
          dataType: 'date',
          format: 'dd.MM.yyyy',
        },
        {
          caption: this.translate.instant('jpk.details.netAmount'),
          dataField: 'netAmount',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 4,
          dataType: 'number',
          format: 'fixedPoint',
        },
        {
          caption: this.translate.instant('jpk.details.vatAmount'),
          dataField: 'vatAmount',
          width: 120,
          minWidth: 100,
          allowSorting: true,
          hidingPriority: 5,
          dataType: 'number',
          format: 'fixedPoint',
        },
      ] as GenericGridColumn[]
  );

  /**
   * Angular OnInit lifecycle hook.
   * 
   * @description Initializes the component by subscribing to route parameters and loading
   * JPK details when an ID is provided. Sets up the parameter subscription for reactive
   * data loading when the route changes.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Automatically called when component initializes
   * // Subscribes to route params like /jpk-details/123
   * ```
   * 
   * @since 1.0.0
   */
  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadJpkDetails(Number(id));
      }
    });
  }

  /**
   * Angular OnDestroy lifecycle hook.
   * 
   * @description Cleanup method that unsubscribes from the route parameters subscription
   * to prevent memory leaks when the component is destroyed.
   * 
   * @returns {void}
   * 
   * @since 1.0.0
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Loads detailed information for a specific JPK submission.
   * 
   * @description Fetches comprehensive JPK details including submission information,
   * related documents, and summary data from the JPK service. Manages loading states
   * and handles both success and error scenarios.
   * 
   * @param {number} id - The unique identifier of the JPK submission to load
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.loadJpkDetails(123); // Loads JPK submission with ID 123
   * ```
   * 
   * @since 1.0.0
   */
  loadJpkDetails(id: number): void {
    this.isLoading.set(true);
    
    this.jpkService.getJpkDetails(id).subscribe({
      next: (details) => {
        this.jpkDetails.set(details);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading JPK details:', error);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Handles tab selection changes in the details view.
   * 
   * @description Updates the selected tab index when user switches between different
   * tabs (Overview, Sales Documents, Purchase Documents, Summary). This enables
   * conditional rendering of tab-specific content.
   * 
   * @param {any} event - The tab selection event containing information about the selected tab
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Event structure when user selects Sales Documents tab:
   * // { addedItems: [{ id: 1, text: 'Sales Documents', icon: 'export' }] }
   * ```
   * 
   * @since 1.0.0
   */
  onTabSelectionChanged(event: any): void {
    this.selectedTabIndex.set(event.addedItems[0].id);
  }

  /**
   * Navigates back to the JPK submissions list.
   * 
   * @description Provides navigation functionality to return to the main JPK submissions
   * component. This method is typically called when user clicks the back button or
   * wants to return to the submissions overview.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.onBack(); // Navigates to /content/jpk-submissions
   * ```
   * 
   * @since 1.0.0
   */
  onBack(): void {
    this.router.navigate(['/content/jpk-submissions']);
  }

  /**
   * Downloads the XML file associated with the JPK submission.
   * 
   * @description Initiates the download of the JPK XML file if available. Opens the file
   * in a new browser tab/window for download. Validates that the JPK details contain
   * a valid XML file path before attempting the download.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.onDownload(); // Downloads the JPK XML file
   * ```
   * 
   * @since 1.0.0
   */
  onDownload(): void {
    const details = this.jpkDetails();
    if (details && details.xmlFilePath) {
      // Tutaj można dodać logikę pobierania pliku
      window.open(details.xmlFilePath, '_blank');
    }
  }
}