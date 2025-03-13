import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Country } from '../interface/country'

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = `${environment.domain}`; // zakładam, że masz zdefiniowany baseUrl w environment

  constructor(private http: HttpClient) {}

  getCompany(): Observable<any> {
    return this.http
      .get<Country[]>(`${this.apiUrl}company`)
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

  updateCompany(company: any): Observable<any> {
    return this.http.put(`${this.apiUrl}company`, company).pipe(catchError(this.handleError));
  }
}
