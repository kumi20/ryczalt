import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import notify from 'devextreme/ui/notify';
import * as CryptoJS from 'crypto-js';
import { AppServices } from './app-services.service';
import { environment } from '../../environments/environment';
import { License } from '../interface/license';

const SALT = '%CxR$%j$i9^2:9_0*2Q!230xs.+';
const TOOLTIP_DELAY = 600;

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

  userListRefresh = new Subject<any>();
  sortingRule: string = 'DESC';

  sessionData: License = {
    licenseNumber: '',
    dataStart: '',
    dataEnd: '',
    isActive: false,
    isVatPayer: false,
    isFPPayer: false,
    isHealthInsurance: false,
    isSocialInsurance: false,
    isSicknessInsurance: false,
  };
  formatPLN = '###,###,###,##0.00';

  tooltipShowEvent = { name: 'dxhoverstart', delay: TOOLTIP_DELAY };
  activeShortcuts = new Subject<any>();
  dateFormat = 'yyyy-MM-dd';

  countryLIst = [
    { name: 'Austria', code: 'AT' },
    { name: 'Belgia', code: 'BE' },
    { name: 'Bułgaria', code: 'BG' },
    { name: 'Chorwacja', code: 'HR' },
    { name: 'Cypr', code: 'CY' },
    { name: 'Czechy', code: 'CZ' },
    { name: 'Dania', code: 'DK' },
    { name: 'Estonia', code: 'EE' },
    { name: 'Finlandia', code: 'FI' },
    { name: 'Francja', code: 'FR' },
    { name: 'Grecja', code: 'GR' },
    { name: 'Hiszpania', code: 'ES' },
    { name: 'Holandia', code: 'NL' },
    { name: 'Irlandia', code: 'IE' },
    { name: 'Litwa', code: 'LT' },
    { name: 'Luksemburg', code: 'LU' },
    { name: 'Łotwa', code: 'LV' },
    { name: 'Malta', code: 'MT' },
    { name: 'Niemcy', code: 'DE' },
    { name: 'Polska', code: 'PL' },
    { name: 'Portugalia', code: 'PT' },
    { name: 'Rumunia', code: 'RO' },
    { name: 'Słowacja', code: 'SK' },
    { name: 'Słowenia', code: 'SI' },
    { name: 'Szwecja', code: 'SE' },
    { name: 'Węgry', code: 'HU' },
    { name: 'Włochy', code: 'IT' },
  ];

  //month list for zus
  monthList = [
    { name: 'Styczeń', value: 1 },
    { name: 'Luty', value: 2 },
    { name: 'Marzec', value: 3 },
    { name: 'Kwiecień', value: 4 },
    { name: 'Maj', value: 5 },
    { name: 'Czerwiec', value: 6 },
    { name: 'Lipiec', value: 7 },
    { name: 'Sierpień', value: 8 },
    { name: 'Wrzesień', value: 9 },
    { name: 'Październik', value: 10 },
    { name: 'Listopad', value: 11 },
    { name: 'Grudzień', value: 12 },
  ];

  //year list for zus
  yearList = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
    { name: '2027', value: 2027 },
    { name: '2028', value: 2028 },
    { name: '2029', value: 2029 },
    { name: '2030', value: 2030 },
  ];

  globalDate = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  }

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

  //function returns default width for documents popup
  setWidthPopUp = () => {
    if (window.innerWidth < 1440) {
      return String(window.innerWidth);
    }
    if (window.innerWidth < 1920) {
      return '1440';
    }
    return String(0.75 * window.innerWidth);
  };

  //function set height popup
  // funkcja ustawia wysokość popupu
  setHeightPopUp = () => {
    if (window.innerHeight < 800) {
      return String(window.innerHeight);
    }
    if (window.innerHeight < 1000) {
      return '800';
    }
    return String(0.75 * window.innerHeight);
  };

  onShownPopUp = (unicalGuid?: any) => {
    let object = {
      unicalGuid: unicalGuid,
      value: true,
    };
    this.activeShortcuts.next(object);
  };

  onHiddenPopUp = (unicalGuid?: any) => {
    let object = {
      unicalGuid: unicalGuid,
      value: false,
    };
    setTimeout(() => {
      this.activeShortcuts.next(object);
      // this.removeKeyboardEventListeners();
    }, 500);
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
      Authorization: 'Bearer ' + localStorage.getItem('app-ryczalt-token'),
    };
    if (ajaxOptions.data.key) {
      ajaxOptions.url += '/' + ajaxOptions.data.key;
    }
  };

  //function returns gross price
  countAmountGross = (netto: number, taxrate: number) => {
    let tax = !isNaN(taxrate) ? taxrate : 0;
    let gross = Number(netto) + Number(netto) * (tax / 100);
    return Number(gross.toFixed(4));
  };

  //function returns net price
  countAmountNet = (brutto: number, taxrate: number) => {
    let tax = !isNaN(taxrate) ? taxrate : 0;

    let netto = Number(brutto) - Number(brutto) * (tax / (tax + 100));
    return Number(netto.toFixed(2));
  };
}
