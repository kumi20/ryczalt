import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Gus, Customer } from '../interface/customers';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.domain}`; // zakładam, że masz zdefiniowany baseUrl w environment

  constructor(private http: HttpClient) {}

  postCustomer(data: Customer): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .post<Customer>(`${this.apiUrl}customers`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  getCustomerById(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .get<Number>(`${this.apiUrl}customers`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  deleteCustomer(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .delete<Number>(`${this.apiUrl}customers`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  putCustomer(data: Customer): Observable<any> {
    const params = new HttpParams().set('id', data.customerId);
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.http
      .put<Customer>(`${this.apiUrl}customers`, data, { params, headers })
      .pipe(catchError(this.handleError));
  }

  getCustomerByVat(vatNumber: string): Observable<Gus> {
    const params = new HttpParams().set('nip', vatNumber);

    return this.http
      .get<Gus>(`${this.apiUrl}customers/gus`, { params })
      .pipe(
        map((response) => this.mapToCustomer(response)),
        catchError(this.handleError)
      );
  }

  private mapToCustomer(data: any): Gus {
    return {
      customerName: data.customerName || '',
      customerVat: data.customerVat || '',
      street: data.street || '',
      city: data.city || '',
      postalCode: data.postalCode || '',
      country: data.country || '',
      email: data.email || '',
      phone: data.phone || '',
    };
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
