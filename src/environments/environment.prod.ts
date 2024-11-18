import { DatePipe } from '@angular/common';
import { WindowEnv } from './environment.model';

let env;
const windowEnv: WindowEnv = (window as any).env || {};

env = {
  production: true,
  domain: windowEnv.domain || 'default',
  authDomain: windowEnv.authDomain || 'default',
  AUTHAPI: windowEnv.AUTHAPI || 'default',
  APIGUS: windowEnv.APIGUS || 'default',
  CAS_CLIENT_ID: windowEnv.CAS_CLIENT_ID || 'default',
  oauthCallbackUrl: window.location.origin,
  app_url: '<APP_URL>', //Example: https://myapp.com
  cas_url: '<CAS_URL>', //Example: https://mycas.com/cas
  cas_validate_url: '<CAS_VALIDATE_TICKET>', //Example: https://mycas.com/cas/serviceValidate
  ABS_BUILD_DATE:
    windowEnv.ABS_BUILD_DATE ||
    new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd'),
  ABS_BUILD_ID: windowEnv.ABS_BUILD_ID || 'default',
};

export const environment = env;
