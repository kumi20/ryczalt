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

const token = localStorage.getItem('app-ryczalt-token');

@Injectable({
  providedIn: 'root',
})
export class FlateRateService {
  private apiUrl = `${environment.domain}`; // zakładam, że masz zdefiniowany baseUrl w environment

  constructor(private http: HttpClient) {}

  put(data: FlateRate) {
    const params = new HttpParams().set('id', data.ryczaltId);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .put<FlateRate>(`${this.apiUrl}flateRate`, data, { params, headers })
      .pipe(catchError(this.handleError));
  }

  post(data: FlateRate) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .post<FlateRate>(`${this.apiUrl}flateRate`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .delete<Number>(`${this.apiUrl}flateRate`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  openMonth(object: OpenCloseRequest): Observable<any> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .post<CheckIfMonthIsClosed>(`${this.apiUrl}flateRate/openMonth`, object, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  closeMonth(object: OpenCloseRequest): Observable<any> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .post<CheckIfMonthIsClosed>(
        `${this.apiUrl}flateRate/closeMonth`,
        object,
        {
          headers,
        }
      )
      .pipe(catchError(this.handleError));
  }

  summaryMonth(month: number, year: number) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http
      .get<SummaryMonth>(`${this.apiUrl}flateRate/summaryMonth`, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  checkIfMonthIsClosed(
    month: number,
    year: number
  ): Observable<CheckIfMonthIsClosed> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    let params = new HttpParams().set('month', month).set('year', year);

    return this.http
      .get<CheckIfMonthIsClosed>(`${this.apiUrl}flateRate/statusMonth`, {
        params,
        headers,
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
