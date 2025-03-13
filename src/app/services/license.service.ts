import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface License {
  licenseNumber: string;
  dataStart: string;
  dataEnd: string;
  isActive: boolean;
  isVatPayer: boolean;
  isFPPayer: boolean;
  isHealthInsurance: boolean;
  isSocialInsurance: boolean;
  isSicknessInsurance: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private apiUrl = `${environment.domain}license`; // zakładam, że masz zdefiniowany baseUrl w environment

  constructor(private http: HttpClient) {}

  getLicenseInfo(): Observable<License> {
    return this.http.get<License>(this.apiUrl);
  }
}
