import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FlatRateTax, FlatRateTaxResponse } from '../interface/flatRateTax';
import {
  FlatRateTaxCalculateRequest,
  FlatRateTaxCalculateResponse
} from '../interface/flatRateTaxCalculate';


@Injectable({
  providedIn: 'root'
})
export class FlatRateTaxService {
  private apiUrl = `${environment.domain}flat-rate-tax`;

  constructor(private http: HttpClient) {}

  getByMonthAndYear(year: number): Observable<FlatRateTaxResponse> {
    const params = new HttpParams()
      .set('year', year);

    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .get<FlatRateTaxResponse>(this.apiUrl, { params, headers })
      .pipe(catchError(this.handleError));
  }

  post(data: any): Observable<number> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .post<number>(this.apiUrl, data, { headers })
      .pipe(catchError(this.handleError));
  }

  put(data: any): Observable<number> {
    const params = new HttpParams().set('id', data.flatRateTaxId);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .put<number>(this.apiUrl, data, { params, headers })
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .delete<void>(this.apiUrl, { params, headers })
      .pipe(catchError(this.handleError));
  }

  calculate(month: number, year: number): Observable<FlatRateTaxCalculateResponse> {
    const params = new HttpParams()
      .set('year', year)
      .set('month', month);

    return this.http
      .get<FlatRateTaxCalculateResponse>(`${this.apiUrl}/calculate`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    errorMessage = JSON.stringify({
      error: error.status,
      message: error.error?.title || 'Brak dostępu',
      detail: error.error?.details || '',
      errors: error.error?.errors || ''
    });
    return throwError(() => errorMessage);
  }
}
