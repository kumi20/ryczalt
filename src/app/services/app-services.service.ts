import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, ReplaySubject, TimeoutError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
const helper = new JwtHelperService();
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppServices {
  baseUrl = environment.domain;
  authUrl = environment.authDomain;
  dataGusUrl = environment.APIGUS + 'customer/InvoiceAddress/';

  headers: HttpHeaders;

  constructor(private http: HttpClient, private _route: Router) {
    this.headers = new HttpHeaders();
    //this.headers = this.headers.append('Authorization', "Bearer " + localStorage.getItem('wapro-erp-token'));
    this.headers = this.headers.set(
      'Authorization',
      'Bearer ' + localStorage.getItem('app-ryczalt-token')
    );
  }

  getToken(uri: any, data: any) {
    let authHeaders: HttpHeaders = new HttpHeaders();
    authHeaders = authHeaders.set('Authorization', 'Basic ' + data);
    authHeaders = authHeaders.append(
      'content-type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.authUrl + uri, 'grant_type=client_credentials', {
        headers: authHeaders,
      })
      .pipe(retry(0), catchError(this.errorHandl));
  }

  get(uri: string): Observable<any> {
    return this.http
      .get<any>(this.baseUrl + uri)
      .pipe(retry(0), catchError(this.errorHandl));
  }

  getAuth(uri: string): Observable<any> {
    let authHeaders: HttpHeaders = new HttpHeaders();
    authHeaders = authHeaders.set(
      'Authorization',
      'Bearer ' + localStorage.getItem('app-ryczalt-token')
    );
    if (this.isTokenValid()) {
      return this.http
        .get<any>(this.baseUrl + uri, {
          headers: authHeaders,
        })
        .pipe(retry(0), catchError(this.errorHandl));
    } else return this.throwError();
  }

  postAuth(uri: string, date: any): Observable<any> {
    let authHeaders: HttpHeaders = new HttpHeaders();
    authHeaders = authHeaders.set(
      'Authorization',
      'Bearer ' + localStorage.getItem('app-ryczalt-token')
    );

    if (this.isTokenValid()) {
      return this.http
        .post<any>(this.baseUrl + uri, date, {
          headers: authHeaders,
        })
        .pipe(retry(0), catchError(this.errorHandl));
    } else return this.throwError();
  }

  getAuthCompanyData = (nip: string) => {
    return this.http
      .get<any>(
        `https://wpmyaccountapi.assecobs.pl/api/Customer/InvoiceAddress/${nip}`
      )
      .pipe(retry(0), catchError(this.errorHandl));
  };

  putAuth(uri: string, date: any): Observable<any> {
    let authHeaders: HttpHeaders = new HttpHeaders();
    authHeaders = authHeaders.set(
      'Authorization',
      'Bearer ' + localStorage.getItem('app-ryczalt-token')
    );

    if (this.isTokenValid()) {
      return this.http
        .put<any>(this.baseUrl + uri, date, {
          headers: authHeaders,
        })
        .pipe(retry(0), catchError(this.errorHandl));
    } else return this.throwError();
  }

  post(uri: string, date: string): Observable<any> {
    return this.http
      .post<any>(this.baseUrl + uri, date)
      .pipe(retry(0), catchError(this.errorHandl));
  }

  deleteAuth(uri: string): Observable<any> {
    let authHeaders: HttpHeaders = new HttpHeaders();
    authHeaders = authHeaders.set(
      'Authorization',
      'Bearer ' + localStorage.getItem('app-ryczalt-token')
    );
    if (this.isTokenValid()) {
      return this.http
        .delete<any>(this.baseUrl + uri, {
          headers: authHeaders,
        })
        .pipe(retry(0), catchError(this.errorHandl));
    } else return this.throwError();
  }

  getAppList() {
    return this.http
      .get<any>(environment.APIGUS + 'Products')
      .pipe(retry(0), catchError(this.errorHandl));
  }

  errorHandl(error: any) {
    let errorMessage = '';
    errorMessage = JSON.stringify({
      error: error.status,
      message: error.error !== null ? error.error.title : 'Brak dostępu',
      detail: error.error !== null ? error.error.detail : '',
      errors:
        error.error !== null && error.error.errors !== null
          ? error.error.errors
          : '',
    });

    if (error.status === 0) {
      errorMessage = JSON.stringify({
        error: error.status,
        message: 'Brak połączenia z serwerem',
        detail: 'Brak połączenia z serwerem',
        errors: 'Brak połączenia z serwerem',
      });

      setTimeout(() => {
        // window.location.href = `${environment.AUTHAPI}logout?service=https://${location.host}`;
      }, 1000);
    }
    return throwError(errorMessage);
  }

  getDataFromGus(uri: string) {
    return this.http
      .get(this.dataGusUrl + uri)
      .pipe(retry(0), catchError(this.errorHandl));
  }

  //wyjatek jeśli token stracił ważność lub go nie ma
  throwError() {
    sessionStorage.clear();
    localStorage.removeItem('app-ryczalt-token');
    if (
      environment.AUTHAPI === 'https://qa-auth.assecobs.com/' ||
      environment.AUTHAPI === 'https://dev-auth.assecobs.com/' ||
      environment.AUTHAPI === 'https://auth.assecobs.com/'
    ) {
      window.location.href = `${environment.AUTHAPI}logout?service=https://${location.host}`;
    }
    return throwError('Not authenticated');
  }

  //sprawdzenie czy token jest ważby
  isTokenValid() {
    if (
      window.localStorage.getItem('app-ryczalt-token') &&
      new Date().getTime() <=
        helper.decodeToken(localStorage.getItem('app-ryczalt-token') as string)
          .exp *
          1000
    ) {
      return true;
    }
    return false;
  }

  getGuid() {
    return new Date().getTime() + Math.round(Math.random() * 10000);
  }
}
