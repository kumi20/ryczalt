import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxTextBoxModule } from 'devextreme-angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { WaproLoaderComponent } from '../core/wapro-loader/wapro-loader.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderConfig } from '../core/wapro-loader/wapro-loader.interface';
import { EventService } from '../../services/event-services.service';
import { AuthService } from '../../services/auth.service';
import { LicenseService } from '../../services/license.service';
import { License } from '../../interface/license';

/**
 * Login component for user authentication.
 * 
 * This component provides user login functionality with form validation,
 * session management, and license validation. It handles the authentication process
 * and redirects users to the main application after successful login.
 * 
 * @example
 * ```html
 * <app-login></app-login>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    DxTextBoxModule,
    ReactiveFormsModule,
    DxButtonModule,
    WaproLoaderComponent,
    RouterModule,
    TranslateModule,
    CommonModule
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  /**
   * Injected form builder for reactive form creation
   * @type {FormBuilder}
   * @description Provides form building capabilities for creating reactive forms
   * @since 1.0.0
   */
  formBuilder = inject(FormBuilder);
  
  /**
   * Reactive form instance for login form
   * @type {any}
   * @description Contains form controls for login and password validation
   * @since 1.0.0
   */
  form: any;
  
  /**
   * Injected router service for navigation
   * @type {Router}
   * @description Provides routing capabilities for navigation after login
   * @since 1.0.0
   */
  router = inject(Router);
  
  /**
   * Flag indicating if CAS (Central Authentication Service) is enabled
   * @type {boolean}
   * @description Determines if CAS authentication is being used
   * @default false
   * @since 1.0.0
   */
  isCas: boolean = false;
  
  /**
   * Configuration object for the loader component
   * @type {any}
   * @description Contains styling and positioning options for the loading indicator
   * @since 1.0.0
   */
  configLoader: any;
  
  /**
   * Injected event service for global application events
   * @type {EventService}
   * @description Handles global events, notifications, and session management
   * @since 1.0.0
   */
  event = inject(EventService);
  
  /**
   * Injected license service for license validation
   * @type {LicenseService}
   * @description Manages license validation and verification
   * @since 1.0.0
   */
  licenseService = inject(LicenseService);
  
  /**
   * Injected authentication service for user authentication
   * @type {AuthService}
   * @description Handles user authentication, login, and session management
   * @since 1.0.0
   */
  authService = inject(AuthService);

  /**
   * Creates an instance of LoginComponent.
   * 
   * Initializes the loader configuration with custom styling options.
   * 
   * @memberof LoginComponent
   */
  constructor() {
    this.configLoader = new LoaderConfig({
      maxWidth: '100%',
      maxHeight: '100%',
      backgroundColor: 'transparent',
      position: 'relative',
      logoColor: '#bc1a22',
      innerBgColor: '#fff',
      outerBgColor: '#EDEDED',
      spinnerColor: '#bc1a22',
      border: 'none',
      width: '100%',
      height: '140px',
    });
  }

  /**
   * Initializes the component.
   * 
   * Sets up the login form and checks for existing session data.
   * 
   * @returns {void}
   * @memberof LoginComponent
   */
  ngOnInit(): void {
    this.initForm();
    this.checkSessionData();
  }

  /**
   * Initializes the login form with validation rules.
   * 
   * Creates a reactive form with login and password fields, both required.
   * 
   * @private
   * @returns {void}
   * @memberof LoginComponent
   */
  private initForm() {
    this.form = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  /**
   * Checks for existing session data in localStorage.
   * 
   * Retrieves and decrypts session data if it exists, setting it in the event service.
   * 
   * @private
   * @returns {void}
   * @memberof LoginComponent
   */
  private checkSessionData(): void {
    const sessionData = localStorage.getItem('sessionData');
    if (sessionData) {
      this.event.sessionData = this.event.decryptString(sessionData);
    }
  }

  /**
   * Validates the license after successful login.
   * 
   * Makes a request to the license service to verify the license is valid.
   * Returns a promise that resolves with license information or rejects with error.
   * 
   * @returns {Promise<License>} Promise that resolves with license information
   * @memberof LoginComponent
   */
  checkLicenseValidity():Promise<License> {
    return new Promise((resolve, reject) => {
      this.licenseService.getLicenseInfo().subscribe({
        next: (license) => {
          resolve(license);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Handles the login process.
   * 
   * Validates the form, hashes the password, and attempts to authenticate the user.
   * On successful login, validates the license and sets up session data.
   * Redirects to the start page on successful authentication.
   * 
   * @returns {void}
   * @memberof LoginComponent
   */
  onLog() {
    if (this.form.invalid) {
      return;
    }

    this.form.value.password = this.event.hashPassword(this.form.value.password);

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.checkLicenseValidity().then((isValid: License) => {
          this.event.globalDate = {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          };
          localStorage.setItem('dataRange', JSON.stringify(this.event.globalDate));
          this.event.sessionData = isValid;
          localStorage.setItem('sessionData', this.event.encryptString(this.event.sessionData));
          this.router.navigate(['/content/start']);
        });
      },
      error: (error) => {
        this.event.showNotification('error', error.error.error);
      }
    })
  }
}
