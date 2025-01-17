import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import {
  DxButtonModule,
  DxDataGridModule,
  DxLoadPanelModule,
  DxPopupModule,
  DxScrollViewModule,
} from 'devextreme-angular';

import { ConfirmDialogComponent } from './components/core/confirm-dialog/confirm-dialog.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventService } from './services/event-services.service';
import { WaproLoaderComponent } from './components/core/wapro-loader/wapro-loader.component';
import { AppServices } from './services/app-services.service';
import { locale, loadMessages } from 'devextreme/localization';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
const helper = new JwtHelperService();

import { environment } from '../environments/environment';
import plMessages from '../assets/devextreme/localization/messages/pl.json';
import enMessages from '../assets/devextreme/localization/messages/en.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    DxLoadPanelModule,
    WaproLoaderComponent,
    DxPopupModule,
    DxButtonModule,
    TranslateModule,
    DxScrollViewModule,
    DxDataGridModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.event.deviceType = this.deviceType();
  }

  title = 'login';

  event = inject(EventService);
  private appService = inject(AppServices);
  private translate = inject(TranslateService);
  private http = inject(HttpClient);
  routeActive = inject(ActivatedRoute);
  route = inject(Router);

  locale: string = 'pl';
  session: any;
  messageList: any[] = [];
  confirmText: string = '';
  isMessage: boolean = false;
  partnerList: any = [];
  isShowPartner: boolean = false;
  focusedRowKey: number = 0;

  focusedRowSelected: any[] = [];

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Sprawdź, czy użytkownik nacisnął Ctrl + N
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault(); // Zapobiegamy domyślnemu działaniu przeglądarki
    }
  }

  constructor() {}

  ngOnInit() {
    const dataRange = localStorage.getItem('dataRange');
    if (dataRange) {
      this.event.globalDate = JSON.parse(dataRange);
    }
  }

  ngAfterViewInit() {
    this.event.deviceType = this.deviceType();
    this.initMessages();
    this.initializeTranslation();
    this.checkSessionData();
  }

  private checkSessionData(): void {
    const sessionData = localStorage.getItem('sessionData');
    if (sessionData) {
      this.event.sessionData = this.event.decryptString(sessionData);
    }
  }

  private initializeTranslation(): void {
    this.locale = this.getLocale();
    locale(this.locale);
    this.translate.addLangs(['pl', 'en']);
    const localLanguage = localStorage.getItem('lang');
    this.translate.setDefaultLang(localLanguage || 'pl');
  }

  initMessages() {
    loadMessages(plMessages);
    loadMessages(enMessages);
  }

  getLocale() {
    var locale = localStorage.getItem('lang');
    return locale != null ? locale : 'pl';
  }

  deviceType = () => {
    if (window.innerWidth <= 1000) {
      return 'mobile';
    }

    return 'desktop';
  };
}
