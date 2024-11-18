import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxTextBoxModule } from 'devextreme-angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { WaproLoaderComponent } from '../core/wapro-loader/wapro-loader.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderConfig } from '../core/wapro-loader/wapro-loader.interface';
import { EventService } from '../../services/event-services.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    DxTextBoxModule,
    ReactiveFormsModule,
    DxButtonModule,
    WaproLoaderComponent,
    TranslateModule,
    CommonModule
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  form: any;
  router = inject(Router);
  isCas: boolean = false;
  configLoader: any;
  event = inject(EventService);

  authService = inject(AuthService);

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

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLog() {
    if (this.form.invalid) {
      return;
    }

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/content/customers']);
      },
      error: (error) => {
        this.event.showNotification('error', error.error.error);
      }
    })
  }
}