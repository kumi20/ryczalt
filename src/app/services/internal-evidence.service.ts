import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InternalEvidence } from '../interface/internalEvidence';

const token = localStorage.getItem('app-ryczalt-token');

@Injectable({
  providedIn: 'root',
})
export class InternalEvidenceService {
  private apiUrl = `${environment.domain}`;

  constructor(private http: HttpClient) {}

  post(data: InternalEvidence): Observable<InternalEvidence> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .post<InternalEvidence>(`${this.apiUrl}internalEvidence`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  put(data: InternalEvidence): Observable<InternalEvidence> {
    const params = new HttpParams().set('id', data.internalEvidenceId);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .put<InternalEvidence>(`${this.apiUrl}internalEvidence`, data, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http
      .delete<number>(`${this.apiUrl}internalEvidence`, { params, headers })
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