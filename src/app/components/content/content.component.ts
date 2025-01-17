import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
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

const helper = new JwtHelperService();

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
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent implements OnInit, AfterViewInit {
  @HostListener('click', ['$event.target'])
  onClick(): void {
    if (this.isGuideButtonHighlighted) this.isGuideButtonHighlighted = false;
  }

  event = inject(EventService);
  appService = inject(AppServices);

  toolbarContent: any[] = [];
  isdataPortal: boolean = false;
  isDrawerOpen: boolean = true;
  isGuideActive: boolean = false;
  isHideUserPanel: boolean = false;
  isShowQueue: boolean = false;

  selectedOpenMode: OpenedStateMode = 'shrink';
  selectedPosition: PanelLocation = 'left';
  selectedRevealMode: RevealMode = 'slide';

  showSubmenuModes: any[] = [];
  showFirstSubmenuModes: any;
  isShowInfoAboutVersion = false;
  route = inject(Router);
  cdr = inject(ChangeDetectorRef);
  translate = inject(TranslateService);

  location: string;
  navigation: MainMenu[] = [];
  navigationPanelUser: MainMenu[] = [];

  currentUserName: string = '';
  submenu: any;
  code: any;
  userGuideKey: string = 'dashboard';
  private isGuideButtonHighlighted = false;

  infoAboutVersion: string = '';
  ABS_BUILD_DATE: string = '';
  isMenuMobile: boolean = false;
  isSubmenuItemClick: boolean = false;
  itemChosed: any[] = [];
  isMobileSettings: boolean = false;
  isTap: any = null;

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

  ngOnInit(): void {
    localStorage.getItem('dataPortal')
      ? (this.isdataPortal = true)
      : (this.isdataPortal = false);

    if (this.isdataPortal) {
      this.isDrawerOpen = false;
    }
  }

  ngAfterViewInit(): void {}

  runGuide(): void {
    this.isGuideActive = true;
  }

  onGuideFinished(canceled: boolean): void {
    this.isGuideActive = false;
    this.highlightGuideButton(true, 2000);
  }

  private highlightGuideButton(autoHide?: boolean, duration?: number): void {
    this.isGuideButtonHighlighted = true;
    if (autoHide) {
      setTimeout(() => {
        this.isGuideButtonHighlighted = false;
      }, duration);
    }
  }

  onUserPanelClick(): void {
    this.isHideUserPanel = !this.isHideUserPanel;
    this.cdr.detectChanges();
  }

  clickContent(): void {
    this.isHideUserPanel = false;
  }

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

  private initializeMenu(): void {
    this.navigation = [
      {
        id: '1',
        name: this.translate.instant('menu.start'),
        icon: 'dx-icon-home',
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
        icon: 'dx-icon-doc',
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
        icon: 'dx-icon-verticalalignbottom',
        url: 'content/vat-register-sell',
        items: [],
        tooltip: false,
        code: null,
        signature: 'R',
        classCss: 'redHeader',
      },
      {
        id: '4',
        name: this.translate.instant('menu.vatBuy'),
        icon: 'dx-icon-verticalalignbottom',
        url: 'content/vat-register-buy',
        items: [],
        tooltip: false,
        code: null,
        signature: 'R',
        classCss: 'redHeader',
      },
      {
        id: '5',
        name: this.translate.instant('menu.internalEvidence'),
        icon: 'dx-icon-accountbox',
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
        icon: 'dx-icon-accountbox',
        url: 'content/customers',
        items: [],
        tooltip: false,
        code: null,
        signature: 'K',
        classCss: 'redHeader',
      },
      {
        id: '7',
        name: this.translate.instant('menu.dictionaries'),
        icon: 'dx-icon-inactivefolder',
        url: 'content/dictionaries/countries',
        items: [
          {
            id: '71',
            name: this.translate.instant('menu.countries'),
            icon: '',
            url: 'content/dictionaries/countries',
          },
          {
            id: '72',
            name: this.translate.instant('menu.documentType'),
            icon: '',
            url: 'content/dictionaries/document-type',
          },
        ],
        tooltip: false,
        code: null,
        signature: 'S',
        classCss: 'redHeader',
      },
    ];
  }

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
        id: '2',
        name: 'menu.log-out',
        icon: 'icon icon-sign-out',
        url: null,
        items: [],
      },
    ];
  }

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

  private getUserInfo(): void {
    const token = localStorage.getItem('app-ryczalt-token');
    if (token) {
      this.currentUserName = helper.decodeToken(token).sub;
      const index = this.currentUserName?.indexOf('@');
      this.currentUserName = this.currentUserName.substr(0, index);
    }
  }

  itemClick(data: any): void {
    if (data.itemData.id === '1.1') this.event.useLanguage('pl');
    else if (data.itemData.id === '1.2') this.event.useLanguage('en');
    else if (data.itemData.id === '2') this.logOut();
    else if (data.itemData.id === '3') this.isShowInfoAboutVersion = true;
  }

  onItemClickMobile = (e: any) => {
    if (e.itemData.items.length > 0) {
      this.isSubmenuItemClick = true;
      this.itemChosed = e.itemData;
      return;
    }

    this.itemChosed = e.itemData;
    this.route.navigate([e.itemData.url]);
    this.isMenuMobile = false;
  };

  touchStart = (e: any) => {
    this.isTap = e.id;
  };

  touchEnd = () => {
    this.isTap = null;
  };

  scroll(direction: string) {
    if (direction == 'up') {
      window.scrollTo(window.scrollX, 0);
    } else {
      window.scrollTo(window.scrollX, document.body.scrollHeight);
    }
  }
}
