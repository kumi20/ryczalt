import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Note } from '../interface/note.interface';
import { environment } from '../../environments/environment';

const token = localStorage.getItem('app-ryczalt-token');
@Injectable({
  providedIn: 'root'
})
export class TaxVatService {
  private apiUrl = `${environment.domain}tax-vat`;

  constructor(private http: HttpClient) {}

  post(data: any): Observable<number> {
    return this.http
      .post<number>(this.apiUrl, data)
      .pipe(catchError(this.handleError));
  }

  put(data: any): Observable<number> {
    const params = new HttpParams().set('id', data.ID_PODATEK_VAT);

    return this.http
      .put<number>(this.apiUrl, data, { params })
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);

    return this.http
      .delete<void>(this.apiUrl, { params })
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

  calculate(year: number, month: number): Observable<any> {
    const params = new HttpParams()
      .set('year', year)
      .set('month', month);

    return this.http
      .get<any>(`${environment.domain}tax-vat/calculate`, { params })
      .pipe(catchError(this.handleError));
  }
}
