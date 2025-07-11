import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JpkDetails } from '../interface/jpk';

@Injectable({
  providedIn: 'root',
})
export class JpkService {
  private apiUrl = `${environment.domain}`;

  constructor(private http: HttpClient) {}

  getSubmissionsList(year: number): Observable<any> {
    const params = new HttpParams().set('year', year);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .get<any>(`${this.apiUrl}jpk/submissions-list`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  getJpkDetails(id: number): Observable<JpkDetails> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .get<JpkDetails>(`${this.apiUrl}jpk/details/${id}`, { headers })
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