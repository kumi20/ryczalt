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
  fb = inject(FormBuilder);
  form!: FormGroup;
  appService = inject(AppServices);
  eventService = inject(EventService);
  authService = inject(AuthService);
  router = inject(Router);

  isRegister = signal(false);

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

  ngOnInit() {
    this.initForm();
  }

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

  onLogin() {
    this.router.navigate(['/login']);
  }

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

  // Statyczna metoda walidacyjna
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
