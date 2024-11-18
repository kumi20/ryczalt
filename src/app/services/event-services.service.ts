import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import notify from 'devextreme/ui/notify';
import * as CryptoJS from 'crypto-js';
import { AppServices } from './app-services.service';
import { environment } from '../../environments/environment';

const SALT = '%CxR$%j$i9^2:9_0*2Q!230xs.+';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private translate = inject(TranslateService);
  private AppServices = inject(AppServices);
  refreshMenu = new Subject<boolean>();
  queueListRefresh = new Subject<any>();

  language = new Subject<string>();
  impersonateEmail: string = '';
  languageSubscription: Subscription;

  deviceType: 'mobile' | 'desktop' = 'desktop';
  isImportProcessing: boolean = false;

  loadingVisible: boolean = false;
  queueList: any[] = [];
  showDotQueueTask: boolean = false;

  tooltipShowEvent = { name: 'dxhoverstart', delay: 600 };
  userListRefresh = new Subject<any>();

  constructor() {
    this.languageSubscription = new Subscription();
  }

  useLanguage = (language: string) => {
    localStorage.setItem('lang', language);
    this.translate.use(language);
    this.language.next(language);
    parent.document.location.reload();
  };

  initializeTranslation(): void {
    const defaultLang = localStorage.getItem('lang') || 'pl';
    this.translate.setDefaultLang(defaultLang);
    this.languageSubscription = this.language.subscribe((lang) => {
      this.translate.use(lang);
    });
  }

  //szyfruje JSON do AES, aby dane w localstorage czy sessionstorage nie byly przechowywane jawnie
  encryptString = (strignToEncrypt: any) => {
    return CryptoJS.AES.encrypt(
      JSON.stringify(JSON.stringify(strignToEncrypt)),
      SALT
    ).toString();
  };

  //funkcja odszysfrowuje dane AES
  decryptString = (stringToDecrypt: any) => {
    try {
      stringToDecrypt = CryptoJS.AES.decrypt(stringToDecrypt, SALT);
      if (stringToDecrypt.toString()) {
        let pom = JSON.parse(stringToDecrypt.toString(CryptoJS.enc.Utf8));
        return JSON.parse(
          JSON.parse(stringToDecrypt.toString(CryptoJS.enc.Utf8))
        );
      }
    } catch {}
  };

  public showNotification(type: string, message: string): void {
    notify(
      {
        message: message,
        type: type,
        displayTime: 5000,
        closeOnClick: true,
        // position: {
        //   my: 'top right',cd
        //   at: 'top right',
        //   of: window,
        //   offset: '-24px 80px',
        // },
      },
      { position: 'top right', direction: 'down-stack' }
    );
  }

  httpErrorNotification(error: any) {
    const parsed = JSON.parse(error);
    if (parsed?.error == 405) {
      this.showNotification('error', parsed?.message);
    } else if (parsed?.detail) {
      this.showNotification('error', parsed?.detail);
    }
  }

  setFocus = (control: any) => {
    if (control) {
      control.instance.focus();
    }
  };

  onShown() {
    this.loadingVisible = true;
  }

  onHidden() {
    setTimeout(() => {
      this.loadingVisible = false;
    }, 100);
  }

  isValidNip(nip: string): boolean {
    if (typeof nip !== 'string') {
      return false;
    }

    nip = nip.replace(/[\ \-]/gi, '');

    let weight = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    let controlNumber = parseInt(nip.substring(9, 10));
    let weightCount = weight.length;
    for (let i = 0; i < weightCount; i++) {
      sum += parseInt(nip.substr(i, 1)) * weight[i];
    }
    return sum % 11 === controlNumber;
  }

  onAjaxDataSourceError = async (error: any) => {
    const response = JSON.parse(error?.xhr?.response) || {};
    const responseErrors = response.errors
      ? JSON.stringify(response.errors)
      : '';
    const message = response.detail
      ? response.detail
      : response?.title + responseErrors;
    const errorToAdd = {
      date: new Date(),
      message: message,
      statusCode: error?.xhr?.status,
      url: error?.xhr?.responseURL,
      method: 'GET',
    };
    this.onHidden();
    notify({
      message: message,
      type: 'error',
      displayTime: 3000,
      closeOnClick: true,
      position: {
        my: 'top right',
        at: 'top right',
        of: window,
        offset: '-24px 80px',
      },
    });
  };

  // DATASOURCE - funkcje bazowe dla bledu i dolaczanie tokena
  onBeforeSendDataSource = (_method: string, ajaxOptions: any) => {
    if (ajaxOptions.data.sort) {
      delete ajaxOptions.data.sort;
    }
    if (ajaxOptions.data.filter) {
      delete ajaxOptions.data.filter;
    }
    ajaxOptions.headers = {
      Authorization:
        'Bearer ' + localStorage.getItem('app-ryczalt-token'),
    };
    if (ajaxOptions.data.key) {
      ajaxOptions.url += '/' + ajaxOptions.data.key;
    }
  };
}
