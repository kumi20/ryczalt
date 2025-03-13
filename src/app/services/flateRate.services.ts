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
  CheckIfMonthIsClosed,
  OpenCloseRequest,
  FlateRate,
  SummaryMonth,
} from '../interface/flateRate';


@Injectable({
  providedIn: 'root',
})
export class FlateRateService {
  private apiUrl = `${environment.domain}`; // zakładam, że masz zdefiniowany baseUrl w environment

  constructor(private http: HttpClient) {}

  put(data: FlateRate) {
    const params = new HttpParams().set('id', data.ryczaltId);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .put<FlateRate>(`${this.apiUrl}flat-rate`, data, { params, headers })
      .pipe(catchError(this.handleError));
  }

  post(data: FlateRate) {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .post<FlateRate>(`${this.apiUrl}flat-rate`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .delete<Number>(`${this.apiUrl}flat-rate`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  openMonth(object: OpenCloseRequest): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .post<CheckIfMonthIsClosed>(`${this.apiUrl}open-month`, object, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  closeMonth(object: OpenCloseRequest): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .post<CheckIfMonthIsClosed>(
        `${this.apiUrl}close-month`,
        object,
        {
          headers,
        }
      )
      .pipe(catchError(this.handleError));
  }

  summaryMonth(month: number, year: number) {
    const headers = {
      'Content-Type': 'application/json',
    };
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http
      .get<SummaryMonth>(`${this.apiUrl}flat-rate/summary`, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  checkIfMonthIsClosed(
    month: number,
    year: number
  ): Observable<CheckIfMonthIsClosed> {
    let params = new HttpParams().set('month', month).set('year', year);

    return this.http
      .get<CheckIfMonthIsClosed>(`${this.apiUrl}statusMonth`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }

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
}
