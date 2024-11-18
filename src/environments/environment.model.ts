export interface WindowEnv {
  production: boolean;
  domain?: string;
  authDomain?: string;
  AUTHAPI?: string;
  APIGUS?: string;
  oauthCallbackUrl?: string;
  app_url?: string;
  cas_url?: string;
  cas_validate_url?: string;
  ABS_BUILD_DATE: any;
  ABS_BUILD_ID?: string;
  CAS_CLIENT_ID?: string;
}
