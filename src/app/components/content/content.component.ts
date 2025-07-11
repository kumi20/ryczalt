import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import {
  DxButtonModule,
  DxDrawerModule,
  DxListModule,
  DxMenuModule,
  DxPopupModule,
  DxScrollViewModule,
  DxToolbarModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { OpenedStateMode, RevealMode } from 'devextreme/ui/drawer';
import DevExpress from 'devextreme';
import PanelLocation = DevExpress.ui.dxDrawer.PanelLocation;
import { MainMenu } from '../../interface/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventService } from '../../services/event-services.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TopMenuComponent } from '../top-menu/top-menu.component';

import { UserGuideComponent } from '../core/user-guide/user-guide.component';

import { ConfirmDialogComponent } from '../core/confirm-dialog/confirm-dialog.component';
import { MobileListComponent } from '../core/mobile-list/mobile-list.component';
import { MobileMainSubmenuComponent } from '../core/mobile-main-submenu/mobile-main-submenu.component';
import { DatePipe } from '@angular/common';
import { AppServices } from '../../services/app-services.service';

import { environment } from '../../../environments/environment';
import { CompanyComponent } from '../company/company.component';
const helper = new JwtHelperService();

/**
 * ContentComponent - Main application layout component that handles navigation, menu management, and user interface
 * 
 * @description This component serves as the primary layout container for the application, providing:
 * - Main navigation menu with submenu support
 * - Mobile-responsive drawer navigation
 * - User authentication and session management
 * - Language switching functionality
 * - User guide integration
 * - Toolbar and panel management
 * - Multi-language support through TranslateService
 * 
 * @dependencies
 * - EventService - For event handling and notifications
 * - AppServices - For API calls and authentication
 * - TranslateService - For internationalization
 * - Router - For navigation management
 * - JwtHelperService - For JWT token handling
 * 
 * @usage
 * <app-content></app-content>
 * 
 * @implements OnInit - Component initialization lifecycle
 * @implements AfterViewInit - View initialization lifecycle
 * @implements OnDestroy - Component cleanup lifecycle
 * 
 * @since 1.0.0
 */
@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    RouterModule,
    DxToolbarModule,
    DxButtonModule,
    CommonModule,
    DxTooltipModule,
    DxDrawerModule,
    DxScrollViewModule,
    DxMenuModule,
    TranslateModule,
    DxListModule,
    TopMenuComponent,
    UserGuideComponent,
    ConfirmDialogComponent,
    DxPopupModule,
    MobileListComponent,
    MobileMainSubmenuComponent,
    CompanyComponent,
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Global click event handler for the component
   * 
   * @description Handles click events on the entire component to manage UI state.
   * Currently used to hide the guide button highlight when user clicks anywhere.
   * 
   * @returns {void}
   * 
   * @since 1.0.0
   */
  @HostListener('click', ['$event.target'])
  onClick(): void {
    if (this.isGuideButtonHighlighted) this.isGuideButtonHighlighted = false;
  }

  /**
   * Event service instance for global event handling and notifications
   * @type {EventService}
   * @description Provides centralized event management, notifications, device type detection, and internationalization
   * @since 1.0.0
   */
  event = inject(EventService);
  
  /**
   * Application service instance for API calls and authentication
   * @type {AppServices}
   * @description Handles all backend API communication and user authentication operations
   * @since 1.0.0
   */
  appService = inject(AppServices);

  /**
   * Toolbar content configuration array
   * @type {any[]}
   * @description Contains configuration objects for toolbar items including menu toggle button
   * @default []
   * @since 1.0.0
   */
  toolbarContent: any[] = [];
  
  /**
   * Data portal mode flag
   * @type {boolean}
   * @description Indicates if the application is running in data portal mode with restricted navigation
   * @default false
   * @since 1.0.0
   */
  isdataPortal: boolean = false;
  
  /**
   * Drawer open state flag
   * @type {boolean}
   * @description Controls the visibility and state of the main navigation drawer
   * @default true
   * @since 1.0.0
   */
  isDrawerOpen: boolean = true;
  
  /**
   * User guide active state flag
   * @type {boolean}
   * @description Indicates if the interactive user guide is currently active
   * @default false
   * @since 1.0.0
   */
  isGuideActive: boolean = false;
  
  /**
   * User panel visibility flag
   * @type {boolean}
   * @description Controls the visibility of the user dropdown panel
   * @default false
   * @since 1.0.0
   */
  isHideUserPanel: boolean = false;
  
  /**
   * Queue visibility flag
   * @type {boolean}
   * @description Controls the visibility of the processing queue indicator
   * @default false
   * @since 1.0.0
   */
  isShowQueue: boolean = false;

  /**
   * Selected drawer open mode
   * @type {OpenedStateMode}
   * @description Defines how the drawer opens (shrink, push, overlap)
   * @default 'shrink'
   * @since 1.0.0
   */
  selectedOpenMode: OpenedStateMode = 'shrink';
  
  /**
   * Selected drawer position
   * @type {PanelLocation}
   * @description Defines the position of the drawer panel (left, right, top, bottom)
   * @default 'left'
   * @since 1.0.0
   */
  selectedPosition: PanelLocation = 'left';
  
  /**
   * Selected drawer reveal mode
   * @type {RevealMode}
   * @description Defines how the drawer reveals its content (slide, expand)
   * @default 'slide'
   * @since 1.0.0
   */
  selectedRevealMode: RevealMode = 'slide';

  /**
   * Submenu display modes configuration
   * @type {any[]}
   * @description Contains configuration for submenu behavior (hover, click with timing delays)
   * @default []
   * @since 1.0.0
   */
  showSubmenuModes: any[] = [];
  
  /**
   * First submenu mode configuration
   * @type {any}
   * @description Selected submenu mode configuration (typically the first one)
   * @since 1.0.0
   */
  showFirstSubmenuModes: any;
  
  /**
   * Version information dialog visibility flag
   * @type {boolean}
   * @description Controls the visibility of the version information modal
   * @default false
   * @since 1.0.0
   */
  isShowInfoAboutVersion = false;
  
  /**
   * Angular Router service instance
   * @type {Router}
   * @description Provides navigation and routing functionality
   * @since 1.0.0
   */
  route = inject(Router);
  
  /**
   * Change detector reference for manual change detection
   * @type {ChangeDetectorRef}
   * @description Enables manual triggering of change detection cycles
   * @since 1.0.0
   */
  cdr = inject(ChangeDetectorRef);
  
  /**
   * Translation service instance for internationalization
   * @type {TranslateService}
   * @description Provides translation functionality for multi-language support
   * @since 1.0.0
   */
  translate = inject(TranslateService);

  /**
   * Current application location/path
   * @type {string}
   * @description Stores the current URL path for navigation tracking
   * @since 1.0.0
   */
  location: string;
  
  /**
   * Main navigation menu structure
   * @type {MainMenu[]}
   * @description Contains the complete main navigation menu configuration
   * @default []
   * @since 1.0.0
   */
  navigation: MainMenu[] = [];
  
  /**
   * User panel navigation menu structure
   * @type {MainMenu[]}
   * @description Contains the user dropdown panel menu configuration
   * @default []
   * @since 1.0.0
   */
  navigationPanelUser: MainMenu[] = [];

  /**
   * Current logged-in user's name
   * @type {string}
   * @description Stores the current user's name extracted from JWT token
   * @default ''
   * @since 1.0.0
   */
  currentUserName: string = '';
  
  /**
   * Active submenu data
   * @type {any}
   * @description Contains the currently active submenu configuration
   * @since 1.0.0
   */
  submenu: any;
  
  /**
   * Current menu code
   * @type {any}
   * @description Stores the code of the currently active menu item
   * @since 1.0.0
   */
  code: any;
  
  /**
   * User guide key for current page
   * @type {string}
   * @description Identifies which guide content to show for the current page
   * @default 'dashboard'
   * @since 1.0.0
   */
  userGuideKey: string = 'dashboard';
  
  /**
   * Guide button highlight state
   * @type {boolean}
   * @description Controls the visual highlighting of the guide button
   * @default false
   * @since 1.0.0
   */
  private isGuideButtonHighlighted = false;

  /**
   * Application version information string
   * @type {string}
   * @description Formatted version information including build ID and date
   * @default ''
   * @since 1.0.0
   */
  infoAboutVersion: string = '';
  
  /**
   * Application build date
   * @type {string}
   * @description Build date extracted from environment variables
   * @default ''
   * @since 1.0.0
   */
  ABS_BUILD_DATE: string = '';
  
  /**
   * Mobile menu visibility flag
   * @type {boolean}
   * @description Controls the visibility of the mobile navigation menu
   * @default false
   * @since 1.0.0
   */
  isMenuMobile: boolean = false;
  
  /**
   * Submenu item click state flag
   * @type {boolean}
   * @description Indicates if a submenu item has been clicked in mobile view
   * @default false
   * @since 1.0.0
   */
  isSubmenuItemClick: boolean = false;
  
  /**
   * Currently selected menu item
   * @type {MainMenu | null}
   * @description Stores the currently selected menu item for mobile navigation
   * @default null
   * @since 1.0.0
   */
  itemChosed: MainMenu | null = null;
  
  /**
   * Mobile settings visibility flag
   * @type {boolean}
   * @description Controls the visibility of mobile-specific settings
   * @default false
   * @since 1.0.0
   */
  isMobileSettings: boolean = false;
  
  /**
   * Mobile touch interaction state
   * @type {any}
   * @description Stores the current touch interaction state for mobile devices
   * @default null
   * @since 1.0.0
   */
  isTap: any = null;
  
  /**
   * Company information modal visibility signal
   * @type {WritableSignal<boolean>}
   * @description Reactive signal controlling the visibility of the company information modal
   * @default false
   * @since 1.0.0
   */
  isCompanyVisible = signal<boolean>(false);
  
  /**
   * Device type change subscription
   * @type {Subscription | undefined}
   * @description Subscription to device type changes for responsive behavior
   * @since 1.0.0
   */
  private deviceTypeSubscription?: Subscription;

  /**
   * Component constructor - Initializes the ContentComponent with required setup
   * 
   * @description Performs comprehensive initialization including:
   * - Setting up navigation event listeners
   * - Initializing toolbar content and drawer options
   * - Setting up internationalization
   * - Retrieving user information from JWT token
   * - Initializing main and side menu structures
   * - Setting up version information display
   * - Configuring user guide keys based on routes
   * 
   * @example
   * // Component is automatically instantiated by Angular
   * // No direct constructor calls needed
   * 
   * @since 1.0.0
   */
  constructor() {
    this.location = location.pathname;
    this.route.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/content/start') this.userGuideKey = 'dashboard';
        if (event.url === '/content/users/users-list')
          this.userGuideKey = 'users';
        this.location = event.url;
        this.setSubmenu();
      }
    });

    this.initializeToolbarContent();
    this.initializeDxDrawerOption();
    this.event.initializeTranslation();
    this.getUserInfo();

    this.initializeMenu();
    this.initializeSideMenu();
    this.initializeInfoAboutVersion();

    this.location = location.pathname;
  }

  /**
   * Angular OnInit lifecycle hook - Initializes component after construction
   * 
   * @description Performs post-construction initialization including:
   * - Checking data portal mode from localStorage
   * - Configuring drawer state based on portal mode
   * - Subscribing to device type changes for responsive behavior
   * - Triggering change detection for UI updates
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically by Angular framework
   * // No manual invocation needed
   * 
   * @since 1.0.0
   */
  ngOnInit(): void {
    localStorage.getItem('dataPortal')
      ? (this.isdataPortal = true)
      : (this.isdataPortal = false);

    if (this.isdataPortal) {
      this.isDrawerOpen = false;
    }

    this.deviceTypeSubscription = this.event.deviceTypeChange.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  /**
   * Angular AfterViewInit lifecycle hook - Called after view initialization
   * 
   * @description Currently empty but available for future view-related initialization logic.
   * This method is called after Angular has fully initialized the component's view and child views.
   * 
   * @returns {void}
   * 
   * @since 1.0.0
   */
  ngAfterViewInit(): void {}

  /**
   * Activates the user guide feature
   * 
   * @description Enables the interactive user guide by setting the isGuideActive flag to true.
   * This will display the user guide component and begin the guided tour experience.
   * 
   * @returns {void}
   * 
   * @example
   * // Trigger from template
   * <button (click)="runGuide()">Start Guide</button>
   * 
   * @since 1.0.0
   */
  runGuide(): void {
    this.isGuideActive = true;
  }

  /**
   * Handles the completion of the user guide
   * 
   * @description Called when the user guide finishes (either completed or canceled).
   * Deactivates the guide and highlights the guide button briefly to indicate completion.
   * 
   * @param {boolean} canceled - Whether the guide was canceled by the user
   * @returns {void}
   * 
   * @example
   * // Called from UserGuideComponent
   * onGuideFinished(false); // Guide completed
   * onGuideFinished(true);  // Guide canceled
   * 
   * @since 1.0.0
   */
  onGuideFinished(canceled: boolean): void {
    this.isGuideActive = false;
    this.highlightGuideButton(true, 2000);
  }

  /**
   * Highlights the guide button with optional auto-hide functionality
   * 
   * @description Visually highlights the guide button to draw user attention.
   * Can automatically hide the highlight after a specified duration.
   * 
   * @param {boolean} [autoHide] - Whether to automatically hide the highlight
   * @param {number} [duration] - Duration in milliseconds before auto-hiding
   * @returns {void}
   * 
   * @example
   * // Highlight permanently
   * this.highlightGuideButton();
   * 
   * // Highlight for 2 seconds
   * this.highlightGuideButton(true, 2000);
   * 
   * @since 1.0.0
   */
  private highlightGuideButton(autoHide?: boolean, duration?: number): void {
    this.isGuideButtonHighlighted = true;
    if (autoHide) {
      setTimeout(() => {
        this.isGuideButtonHighlighted = false;
      }, duration);
    }
  }

  /**
   * Toggles the visibility of the user panel
   * 
   * @description Handles user panel dropdown toggle functionality.
   * Switches between showing and hiding the user panel and triggers change detection.
   * 
   * @returns {void}
   * 
   * @example
   * // Toggle user panel from template
   * <button (click)="onUserPanelClick()">User Menu</button>
   * 
   * @since 1.0.0
   */
  onUserPanelClick(): void {
    this.isHideUserPanel = !this.isHideUserPanel;
    this.cdr.detectChanges();
  }

  /**
   * Handles clicks on the main content area
   * 
   * @description Hides the user panel when user clicks on the main content area.
   * Used to close dropdowns and panels when clicking outside of them.
   * 
   * @returns {void}
   * 
   * @example
   * // Automatically called from template click handler
   * <div (click)="clickContent()">Main Content</div>
   * 
   * @since 1.0.0
   */
  clickContent(): void {
    this.isHideUserPanel = false;
  }

  /**
   * Handles drawer opened/closed state changes
   * 
   * @description Manages the drawer state change event by:
   * - Hiding the user panel
   * - Updating the menu toggle button visual state
   * - Triggering change detection for UI updates
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically by DxDrawer component
   * <dx-drawer (openedChange)="openedChange()">
   * 
   * @since 1.0.0
   */
  openedChange(): void {
    this.isHideUserPanel = false;
    const text = document.querySelector(
      '.menu-toggle-btn .dx-toolbar-item-content'
    );
    if (text) {
      if (this.isDrawerOpen) {
        text.classList.add('isopen');
      } else {
        text.classList.remove('isopen');
      }
    }
    this.cdr.detectChanges();
  }

  /**
   * Initializes DevExtreme drawer configuration options
   * 
   * @description Sets up the drawer submenu display modes with hover and click behaviors.
   * Configures timing delays for showing and hiding submenu items.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically in constructor
   * this.initializeDxDrawerOption();
   * 
   * @since 1.0.0
   */
  private initializeDxDrawerOption(): void {
    this.showSubmenuModes = [
      {
        name: 'onHover',
        delay: { show: 0, hide: 500 },
      },
      {
        name: 'onClick',
        delay: { show: 0, hide: 300 },
      },
    ];
    this.showFirstSubmenuModes = this.showSubmenuModes[0];
  }

  /**
   * Initializes application version information display
   * 
   * @description Extracts and formats build information from environment variables.
   * Creates a formatted version string with build ID and date for display in the UI.
   * Handles potential errors in build date parsing.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically in constructor
   * this.initializeInfoAboutVersion();
   * 
   * @since 1.0.0
   */
  private initializeInfoAboutVersion(): void {
    try {
      this.ABS_BUILD_DATE =
        environment.ABS_BUILD_DATE instanceof String
          ? environment.ABS_BUILD_DATE?.substring(0, 10)
          : environment.ABS_BUILD_DATE;
    } catch {
      this.ABS_BUILD_DATE = '';
    }

    this.infoAboutVersion = `${environment.ABS_BUILD_ID} z dnia ${new DatePipe(
      'en-US'
    ).transform(this.ABS_BUILD_DATE, 'yyyy-MM-dd')}`;
  }

  /**
   * Initializes the toolbar content configuration
   * 
   * @description Sets up the main toolbar with menu toggle button configuration.
   * Configures button properties including width, icon, and click handler.
   * Handles data portal mode restrictions for menu toggle functionality.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically in constructor
   * this.initializeToolbarContent();
   * 
   * @since 1.0.0
   */
  private initializeToolbarContent(): void {
    this.toolbarContent = [
      {
        widget: 'dxButton',
        location: 'before',
        cssClass: 'menu-toggle-btn',
        options: {
          width: '82px',
          icon: 'menu',
          onClick: () => {
            if (this.isdataPortal) return;
            this.isDrawerOpen = !this.isDrawerOpen;
          },
        },
      },
    ];
  }

  /**
   * Initializes the main navigation menu structure
   * 
   * @description Creates the primary navigation menu with all main sections including:
   * - Dashboard/Start page
   * - Flat Rate forms
   * - VAT registers (sell/buy) - visibility depends on VAT payer status
   * - Internal evidence
   * - Customers management
   * - Tax-related sections (flat rate tax, ZUS, VAT tax, JPK)
   * - Dictionaries (countries, document types, tax offices, notes)
   * 
   * Each menu item includes translation keys, icons, URLs, and conditional visibility.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically in constructor
   * this.initializeMenu();
   * 
   * @since 1.0.0
   */
  private initializeMenu(): void {
    this.navigation = [
      {
        id: '1',
        name: this.translate.instant('menu.start'),
        icon: 'ryczalt-icon ri-home',
        url: 'content/start',
        items: [],
        tooltip: false,
        code: null,
        signature: 'K',
        classCss: 'redHeader',
      },
      {
        id: '2',
        name: this.translate.instant('menu.flateRate'),
        icon: 'ryczalt-icon ri-file',
        url: 'content/flate-rate',
        items: [],
        tooltip: false,
        code: null,
        signature: 'R',
        classCss: 'redHeader',
      },
      {
        id: '3',
        name: this.translate.instant('menu.vatSell'),
        icon: 'ryczalt-icon ri-taxnote',
        url: 'content/vat-register-sell',
        items: [],
        tooltip: false,
        code: null,
        signature: 'R',
        classCss: 'redHeader',
        visible: this.event.sessionData.isVatPayer,
      },
      {
        id: '4',
        name: this.translate.instant('menu.vatBuy'),
        icon: 'ryczalt-icon ri-taxnote',
        url: 'content/vat-register-buy',
        items: [],
        tooltip: false,
        code: null,
        signature: 'R',
        classCss: 'redHeader',
        visible: this.event.sessionData.isVatPayer,
      },
      {
        id: '5',
        name: this.translate.instant('menu.internalEvidence'),
        icon: 'ryczalt-icon ri-document',
        url: 'content/internal-evidence',
        items: [],
        tooltip: false,
        code: null,
        signature: 'K',
        classCss: 'redHeader',
      },
      {
        id: '6',
        name: this.translate.instant('menu.customers'),
        icon: 'ryczalt-icon ri-clients',
        url: 'content/customers',
        items: [],
        tooltip: false,
        code: null,
        signature: 'K',
        classCss: 'redHeader',
      },
      {
        id: '7',
        name: this.translate.instant('menu.tax'),
        icon: 'ryczalt-icon ri-document-sum',
        url: 'content/zus',
        tooltip: false,
        code: null,
        signature: 'P',
        classCss: 'redHeader',
        items: [
          {
            id: '71',
            name: this.translate.instant('menu.flatRateTax'),
            icon: '',
            url: 'content/flat-rate-tax',
          },
          {
            id: '72',
            name: 'ZUS',
            icon: '',
            url: 'content/zus',
          },
          {
            id: '73',
            name: this.translate.instant('menu.taxVat'),
            icon: '',
            url: 'content/vat-tax',
            visible: this.event.sessionData.isVatPayer,
          },
          {
            id: '74',
            name: this.translate.instant('menu.jpk'),
            icon: '',
            url: 'content/jpk-submissions',
          },
        ],
      },
      {
        id: '8',
        name: this.translate.instant('menu.dictionaries'),
        icon: 'ryczalt-icon ri-file',
        url: 'content/dictionaries/countries',
        items: [
          {
            id: '81',
            name: this.translate.instant('menu.countries'),
            icon: '',
            url: 'content/dictionaries/countries',
          },
          {
            id: '82',
            name: this.translate.instant('menu.documentType'),
            icon: '',
            url: 'content/dictionaries/document-type',
          },
          {
            id: '84',
            name: this.translate.instant('menu.taxOffices'),
            icon: '',
            url: 'content/dictionaries/tax-offices',
          },
          {
            id: '85',
            name: this.translate.instant('menu.notes'),
            icon: '',
            url: 'content/dictionaries/notes',
          },
        ],
        tooltip: false,
        code: null,
        signature: 'S',
        classCss: 'redHeader',
      },
    ];
  }

  /**
   * Initializes the user panel side menu
   * 
   * @description Creates the user panel dropdown menu structure including:
   * - Language selection options (Polish, English, German, Ukrainian)
   * - Version information display
   * - Company information access
   * - Logout functionality
   * 
   * Each menu item includes translation keys and appropriate icons.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically in constructor
   * this.initializeSideMenu();
   * 
   * @since 1.0.0
   */
  private initializeSideMenu(): void {
    this.navigationPanelUser = [
      {
        id: '1',
        name: 'menu.navigationPanelUser.languageApplications',
        icon: 'icon absui-icon--public',
        url: null,
        items: [
          {
            id: '1.1',

            name: 'menu.navigationPanelUser.polishLanguage',

            icon: '',
            url: 'start',
          },
          {
            id: '1.2',
            name: 'menu.navigationPanelUser.englishLanguage',
            icon: '',
            url: 'start',
          },
          {
            id: '1.3',
            name: 'menu.navigationPanelUser.germanLanguage',
            icon: '',
            url: 'start',
          },

          {
            id: '1.4',
            name: 'menu.navigationPanelUser.ukrainianLanguage',
            icon: '',
            url: 'start',
          },

        ],
      },
      {
        id: '3',
        name: 'menu.navigationPanelUser.versionInformation',
        icon: 'icon absui-icon--info',
        url: null,
        items: [],
      },
      {
        id: '4',
        name: 'menu.navigationPanelUser.company',
        icon: '',
        url: null,
        items: [],
      },
      {
        id: '2',
        name: 'menu.log-out',
        icon: 'icon icon-sign-out',
        url: null,
        items: [],
      },
    ];
  }

  /**
   * Sets the active submenu based on current route
   * 
   * @description Analyzes the current URL path to determine which menu item should be active.
   * Finds the matching navigation item and updates the submenu state accordingly.
   * Uses setTimeout to ensure proper timing with route changes.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically on route changes
   * // or manually trigger submenu update
   * this.setSubmenu();
   * 
   * @since 1.0.0
   */
  setSubmenu(): void {
    setTimeout(() => {
      const page = location.pathname.split('/');

      this.submenu = this.navigation.find((el) => {
        this.code = el.code;
        if (el.url) {
          const url = el.url.split('/');
          return url[1] === page[2];
        }
        return false;
      });
      this.cdr.detectChanges();
    }, 0);
  }

  /**
   * Clears all application-related data from browser storage
   * 
   * @description Removes all tokens, session data, and application-specific items from
   * both localStorage and sessionStorage. Used during logout to ensure clean state.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically during logout
   * this.clearLocalStorage();
   * 
   * @since 1.0.0
   */
  private clearLocalStorage(): void {
    sessionStorage.clear();
    localStorage.removeItem('app-ryczalt-token');
    localStorage.removeItem('sessionInfoPortalManagment');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('sessionInfoWaproHtml');
    localStorage.removeItem('appPermissions');
    localStorage.removeItem('typesInvoice');
    localStorage.removeItem('WarehouseDocumentsType');
    localStorage.removeItem('InvoicesDocumentsType');
    localStorage.removeItem('impersonate');
  }

  /**
   * Redirects user to appropriate logout endpoint
   * 
   * @description Handles logout redirection based on the authentication API environment.
   * For production/QA/dev environments, redirects to external auth service.
   * For local development, navigates to local login page.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically during logout process
   * this.redirectToLogout();
   * 
   * @since 1.0.0
   */
  private redirectToLogout(): void {
    if (
      environment.AUTHAPI === 'https://qa-auth.assecobs.com/' ||
      environment.AUTHAPI === 'https://dev-auth.assecobs.com/' ||
      environment.AUTHAPI === 'https://auth.assecobs.com/'
    ) {
      localStorage.setItem('logOut', 'true');
      window.location.href = `${environment.AUTHAPI}logout?service=https://${location.host}`;
    } else {
      this.route.navigate(['']);
    }
  }

  /**
   * Handles user logout process
   * 
   * @description Manages the complete logout workflow including:
   * - Checking for impersonation mode and handling it appropriately
   * - Making API calls to clear server-side impersonation state
   * - Clearing local storage and redirecting to logout
   * - Handling logout errors with appropriate notifications
   * 
   * @returns {void}
   * 
   * @example
   * // Called from user panel logout option
   * this.logOut();
   * 
   * @since 1.0.0
   */
  private logOut(): void {
    if (localStorage.getItem('impersonate')) {
      setTimeout(() => {
        this.appService.deleteAuth(`Users/admin/impersonate`).subscribe({
          next: () => {
            this.clearLocalStorage();
            this.event.impersonateEmail = '';
            this.redirectToLogout();
          },
          error: (error) => {
            const parsedError = JSON.parse(error);
            if (parsedError.error === 405)
              this.event.showNotification('error', parsedError.message);
            else this.event.showNotification('error', parsedError.detail);
          },
        });
      }, 0);
      return;
    }
    this.clearLocalStorage();
    this.redirectToLogout();
  }

  /**
   * Extracts user information from JWT token
   * 
   * @description Retrieves and decodes the JWT token to extract the username.
   * Removes the email domain part to display only the username portion.
   * Updates the currentUserName property for display in the UI.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically in constructor
   * this.getUserInfo();
   * 
   * @since 1.0.0
   */
  private getUserInfo(): void {
    const token = localStorage.getItem('app-ryczalt-token');
    if (token) {
      this.currentUserName = helper.decodeToken(token).sub;
      const index = this.currentUserName?.indexOf('@');
      this.currentUserName = this.currentUserName.substr(0, index);
    }
  }

  /**
   * Handles clicks on user panel menu items
   * 
   * @description Processes user panel menu item clicks and performs appropriate actions:
   * - Language switching (Polish, English, German, Ukrainian)
   * - Logout functionality
   * - Version information display
   * - Company information display
   * 
   * @param {any} data - Click event data containing itemData with menu item information
   * @returns {void}
   * 
   * @example
   * // Called automatically from template
   * <dx-menu (itemClick)="itemClick($event)">
   * 
   * @since 1.0.0
   */
  itemClick(data: any): void {
    if (data.itemData.id === '1.1') this.event.useLanguage('pl');
    else if (data.itemData.id === '1.2') this.event.useLanguage('en');
    else if (data.itemData.id === '1.3') this.event.useLanguage('de');
    else if (data.itemData.id === '1.4') this.event.useLanguage('ua');
    else if (data.itemData.id === '2') this.logOut();
    else if (data.itemData.id === '3') this.isShowInfoAboutVersion = true;
    else if (data.itemData.id === '4') this.isCompanyVisible.set(true);
  }

  /**
   * Handles mobile menu item clicks
   * 
   * @description Processes mobile navigation menu item clicks with different behaviors:
   * - For items with subitems: shows submenu and sets selected item
   * - For items with URLs: navigates to the URL and closes mobile menu
   * - Manages mobile menu state and navigation flow
   * 
   * @param {any} e - Click event data containing itemData or direct item data
   * @returns {void}
   * 
   * @example
   * // Called automatically from mobile menu template
   * <mobile-list (itemClick)="onItemClickMobile($event)">
   * 
   * @since 1.0.0
   */
  onItemClickMobile = (e: any) => {
    const itemData = e.itemData || e;
    
    if (itemData.items && itemData.items.length > 0) {
      this.isSubmenuItemClick = true;
      this.itemChosed = itemData;
      return;
    }

    if (itemData.url) {
      this.itemChosed = itemData;
      this.route.navigate([itemData.url]);
      this.isMenuMobile = false;
    }
  };

  /**
   * Handles touch start events for mobile interactions
   * 
   * @description Captures the start of touch events and stores the touched item ID
   * for mobile touch interaction handling.
   * 
   * @param {any} e - Touch event data containing the item ID
   * @returns {void}
   * 
   * @example
   * // Called automatically from mobile touch events
   * <div (touchstart)="touchStart($event)">
   * 
   * @since 1.0.0
   */
  touchStart = (e: any) => {
    this.isTap = e.id;
  };

  /**
   * Handles touch end events for mobile interactions
   * 
   * @description Clears the touched item ID when touch interaction ends,
   * resetting the touch state for mobile UI interactions.
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically from mobile touch events
   * <div (touchend)="touchEnd()">
   * 
   * @since 1.0.0
   */
  touchEnd = () => {
    this.isTap = null;
  };

  /**
   * Scrolls the page to top or bottom
   * 
   * @description Provides programmatic scrolling functionality for the page.
   * Scrolls to the very top (0) or bottom (document height) of the page.
   * 
   * @param {string} direction - Direction to scroll ('up' for top, anything else for bottom)
   * @returns {void}
   * 
   * @example
   * // Scroll to top
   * this.scroll('up');
   * 
   * // Scroll to bottom
   * this.scroll('down');
   * 
   * @since 1.0.0
   */
  scroll(direction: string) {
    if (direction == 'up') {
      window.scrollTo(window.scrollX, 0);
    } else {
      window.scrollTo(window.scrollX, document.body.scrollHeight);
    }
  }

  /**
   * Angular OnDestroy lifecycle hook - Cleanup when component is destroyed
   * 
   * @description Performs cleanup operations when the component is being destroyed:
   * - Unsubscribes from device type change subscription to prevent memory leaks
   * - Ensures proper cleanup of observables and event listeners
   * 
   * @returns {void}
   * 
   * @example
   * // Called automatically by Angular framework
   * // No manual invocation needed
   * 
   * @since 1.0.0
   */
  ngOnDestroy(): void {
    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();
    }
  }
}
