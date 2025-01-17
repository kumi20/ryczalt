import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  VatRegister,
  SummaryMonthVatRegiser,
  VatPurchaseSummary
} from './../interface/vatRegister';

const token = localStorage.getItem('app-ryczalt-token');

@Injectable({
  providedIn: 'root',
})
export class VatRegisterService {
  private apiUrl = `${environment.domain}`; // zakładam, że masz zdefiniowany baseUrl w environment

  constructor(private http: HttpClient) {}

  put(data: VatRegister) {
    const params = new HttpParams().set('id', data.vatRegisterId);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .put<VatRegister>(`${this.apiUrl}registeVat/sell`, data, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  post(data: VatRegister) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .post<VatRegister>(`${this.apiUrl}registeVat/sell`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .delete<Number>(`${this.apiUrl}registeVat/sell`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  //   openMonth(object: OpenCloseRequest): Observable<any> {
  //     const headers = {
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     };

  //     return this.http
  //       .post<CheckIfMonthIsClosed>(`${this.apiUrl}flateRate/openMonth`, object, {
  //         headers,
  //       })
  //       .pipe(catchError(this.handleError));
  //   }

  //   closeMonth(object: OpenCloseRequest): Observable<any> {
  //     const headers = {
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     };

  //     return this.http
  //       .post<CheckIfMonthIsClosed>(
  //         `${this.apiUrl}flateRate/closeMonth`,
  //         object,
  //         {
  //           headers,
  //         }
  //       )
  //       .pipe(catchError(this.handleError));
  //   }

  summaryMonth(
    month: number,
    year: number
  ): Observable<SummaryMonthVatRegiser> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http
      .get<SummaryMonthVatRegiser>(`${this.apiUrl}registeVat/summaryMonth`, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  //   checkIfMonthIsClosed(
  //     month: number,
  //     year: number
  //   ): Observable<CheckIfMonthIsClosed> {
  //     const headers = {
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     };

  //     let params = new HttpParams().set('month', month).set('year', year);

  //     return this.http
  //       .get<CheckIfMonthIsClosed>(`${this.apiUrl}flateRate/statusMonth`, {
  //         params,
  //         headers,
  //       })
  //       .pipe(catchError(this.handleError));
  //   }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    errorMessage = JSON.stringify({
      error: error.status,
      message: error.error !== null ? error.error.title : 'Brak dostępu',
      detail: error.error !== null ? error.error.details : '',
      errors:
        error.error !== null && error.error.errors !== null
          ? error.error.errors
          : '',
    });
    return throwError(errorMessage);
  }


  postBuy(data: VatRegister) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .post<VatRegister>(`${this.apiUrl}registeVat/buy`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  putBuy(data: VatRegister) {
    const params = new HttpParams().set('id', data.vatRegisterId);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .put<VatRegister>(`${this.apiUrl}registeVat/buy`, data, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  summaryMonthBuy(
    month: number,
    year: number
  ): Observable<VatPurchaseSummary> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http
      .get<VatPurchaseSummary>(`${this.apiUrl}registeVat/summaryMonthBuy`, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }
}
