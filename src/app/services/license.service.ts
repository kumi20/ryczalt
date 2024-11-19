import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface License {
  licenseNumber: string;
  dataStart: string;
  dataEnd: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private apiUrl = `${environment.domain}license`; // zakładam, że masz zdefiniowany baseUrl w environment

  constructor(private http: HttpClient) {}

  getLicenseInfo(): Observable<License> {
    const token = localStorage.getItem('app-ryczalt-token'); // lub pobierz token z serwisu autoryzacji

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get<License>(this.apiUrl, { headers });
  }
}
