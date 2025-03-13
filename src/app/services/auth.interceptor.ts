import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

const helper = new JwtHelperService();
const TOKEN_KEY = 'app-ryczalt-token';
const LOGIN_ENDPOINT = 'login';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const url = req.url;
  const isExternalRequest = !url.includes(environment.domain);
  const isLoginRequest = url.endsWith(LOGIN_ENDPOINT);

  if (isExternalRequest || isLoginRequest) {
    return next(req);
  }

  // Sprawdź, czy token jest ważny
  if (!isTokenValid()) {
    handleInvalidToken();
    return throwError(() => 'Not authenticated');
  }

  // Dodaj token do nagłówka Authorization
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Obsługa błędów autoryzacji (401, 403)
        if (error.status === 401 || error.status === 403) {
          handleInvalidToken();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

function isTokenValid(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (
    token &&
    new Date().getTime() <= helper.decodeToken(token).exp * 1000
  ) {
    return true;
  }
  return false;
}

function handleInvalidToken(): void {
  sessionStorage.clear();
  localStorage.removeItem(TOKEN_KEY);

  if (
    environment.AUTHAPI === 'https://qa-auth.assecobs.com/' ||
    environment.AUTHAPI === 'https://dev-auth.assecobs.com/' ||
    environment.AUTHAPI === 'https://auth.assecobs.com/'
  ) {
    window.location.href = `${environment.AUTHAPI}logout?service=https://${location.host}`;
  }
}