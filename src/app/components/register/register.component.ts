import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { AppServices } from '../../services/app-services.service';
import { EventService } from '../../services/event-services.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
/**
 * User registration component for creating new accounts.
 * 
 * This component provides user registration functionality with comprehensive form validation,
 * including NIP validation, password strength requirements, and email validation.
 * It handles the registration process and provides feedback to users.
 * 
 * @example
 * ```html
 * <app-register></app-register>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DxTextBoxModule,
    CommonModule,
    DxButtonModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  /**
   * Injected form builder for reactive form creation
   * @type {FormBuilder}
   * @description Provides form building capabilities for creating reactive forms
   * @since 1.0.0
   */
  fb = inject(FormBuilder);
  
  /**
   * Reactive form instance for user registration
   * @type {FormGroup}
   * @description Contains form controls for user registration with validation
   * @since 1.0.0
   */
  form!: FormGroup;
  
  /**
   * Injected application service for API operations
   * @type {AppServices}
   * @description Provides application-level services and HTTP operations
   * @since 1.0.0
   */
  appService = inject(AppServices);
  
  /**
   * Injected event service for global events and notifications
   * @type {EventService}
   * @description Handles global events, notifications, and error handling
   * @since 1.0.0
   */
  eventService = inject(EventService);
  
  /**
   * Injected authentication service for user management
   * @type {AuthService}
   * @description Handles user authentication and registration operations
   * @since 1.0.0
   */
  authService = inject(AuthService);
  
  /**
   * Injected router service for navigation
   * @type {Router}
   * @description Provides routing capabilities for navigation after registration
   * @since 1.0.0
   */
  router = inject(Router);

  /**
   * Signal indicating whether registration is in progress
   * @type {Signal<boolean>}
   * @description Tracks registration state to show loading indicators
   * @default false
   * @since 1.0.0
   */
  isRegister = signal(false);

  /**
   * Validates Polish NIP (Tax Identification Number).
   * 
   * Performs comprehensive NIP validation including:
   * - Format validation (10 digits)
   * - Checksum validation using official algorithm
   * 
   * @param {FormControl} control - The form control to validate
   * @returns {ValidationErrors | null} Validation errors or null if valid
   * @memberof RegisterComponent
   */
  validateNip = (control: FormControl): ValidationErrors | null => {
    const nip = control.value;

    if (!nip) return null;

    // Usuń wszystkie znaki niebędące cyframi
    const cleanNip = nip.replace(/[^0-9]/g, '');

    // Sprawdź czy NIP ma dokładnie 10 cyfr
    if (cleanNip.length !== 10) {
      return { invalidLength: true };
    }

    // Wagi do obliczenia sumy kontrolnej
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];

    // Oblicz sumę kontrolną
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanNip[i]) * weights[i];
    }

    // Oblicz cyfrę kontrolną
    const checksum = sum % 11;

    // Sprawdź czy obliczona cyfra kontrolna zgadza się z ostatnią cyfrą NIPu
    if (checksum !== parseInt(cleanNip[9])) {
      return { invalidChecksum: true };
    }

    return null;
  };

  /**
   * Validates password strength requirements.
   * 
   * Checks for multiple password strength criteria:
   * - Minimum length (8 characters)
   * - At least one uppercase letter
   * - At least one digit
   * - At least one special character
   * 
   * @param {FormControl} control - The form control to validate
   * @returns {ValidationErrors | null} Validation errors or null if valid
   * @memberof RegisterComponent
   */
  validatePasswordStrength = (control: FormControl): ValidationErrors | null => {
    const password = control.value;

    if (!password) return null;

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const errors: ValidationErrors = {};
    let hasError = false;

    if (password.length < minLength) {
      errors['minLength'] = true;
      hasError = true;
    }

    if (!hasUpperCase) {
      errors['upperCase'] = true;
      hasError = true;
    }

    if (!hasDigit) {
      errors['digit'] = true;
      hasError = true;
    }

    if (!hasSpecialChar) {
      errors['specialChar'] = true;
      hasError = true;
    }

    return hasError ? errors : null;
  };

  /**
   * Initializes the component.
   * 
   * Sets up the registration form with all validation rules.
   * 
   * @returns {void}
   * @memberof RegisterComponent
   */
  ngOnInit() {
    this.initForm();
  }

  /**
   * Handles the registration process.
   * 
   * Validates the form, hashes the password, and submits the registration request.
   * Shows success message on successful registration or error notification on failure.
   * 
   * @returns {void}
   * @memberof RegisterComponent
   */
  onRegister() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.form.value.psw = this.eventService.hashPassword(this.form.value.psw);
    this.authService.register(this.form.value).subscribe(
      (res) => {
        this.isRegister.set(true);
      },
      (err) => {
        this.eventService.httpErrorNotification(err);
      }
    );
  }

  /**
   * Navigates to the login page.
   * 
   * Redirects the user to the login component.
   * 
   * @returns {void}
   * @memberof RegisterComponent
   */
  onLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Initializes the registration form with validation rules.
   * 
   * Creates a reactive form with all required fields and their validators:
   * - NIP: Required with custom NIP validation
   * - Email: Required with email format validation
   * - Password: Required with strength validation
   * - Password repeat: Required with matching validation
   * - First/Last name: Required
   * - Agreement: Required to be true
   * 
   * @returns {void}
   * @memberof RegisterComponent
   */
  initForm() {
    this.form = this.fb.group(
      {
        nip: ['', [Validators.required, this.validateNip]],
        email: ['', [Validators.required, Validators.email]],
        psw: ['', [Validators.required, this.validatePasswordStrength]],
        pswRepeat: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        isAgree: [false, [Validators.requiredTrue]],
      },
      { validators: RegisterComponent.passwordMatchValidator }
    );
  }

  /**
   * Static validator for password matching.
   * 
   * Validates that the password and password repeat fields match.
   * Sets error on the password repeat field if they don't match.
   * 
   * @static
   * @param {AbstractControl} control - The form control group
   * @returns {ValidationErrors | null} Validation errors or null if valid
   * @memberof RegisterComponent
   */
  static passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const psw = control.get('psw');
    const pswRepeat = control.get('pswRepeat');

    if (psw?.value !== pswRepeat?.value) {
      pswRepeat?.setErrors({ invalidPswRepeat: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}
