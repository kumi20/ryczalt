import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Zus, OpenCloseZusRequest, ZusStatusResponse, ContributionsZUS } from '../interface/zus';

const token = localStorage.getItem('app-ryczalt-token');

@Injectable({
  providedIn: 'root',
})
export class ZusService {
  private apiUrl = `${environment.domain}zus`;

  constructor(private http: HttpClient) {}

  /**
   * Pobiera wpisy ZUS dla danego miesiąca i roku
   */
  getByMonthAndYear(year: number): Observable<ContributionsZUS[]> {
    const params = new HttpParams()
      .set('year', year);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .get<ContributionsZUS[]>(this.apiUrl + '/contributions', { params, headers })
      .pipe(catchError(this.handleError));
  }

  getZus(month: number, year: number): Observable<any> {
    const params = new HttpParams()
      .set('month', month)
      .set('year', year);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http.get<Zus[]>(this.apiUrl, { params, headers }).pipe(catchError(this.handleError));
  }

  /**
   * Dodaje nowy wpis ZUS
   */
  post(data: ContributionsZUS): Observable<number> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .post<number>(this.apiUrl + '/contributions', data, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Aktualizuje istniejący wpis ZUS
   */
  put(data: ContributionsZUS): Observable<number> {
    const params = new HttpParams().set('id', data.contributionsZUSId);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .put<number>(this.apiUrl + '/contributions', data, { params, headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Usuwa wpis ZUS
   */
  delete(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .delete<void>(this.apiUrl + '/contributions', { params, headers })
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
