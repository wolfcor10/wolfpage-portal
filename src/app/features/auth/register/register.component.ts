import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { GoogleIdentityService } from '../../../core/auth/google-identity.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly router = inject(Router);

  loading = false;
  googleLoading = false;
  error = '';
  message = '';
  readonly googleConfigured = this.googleIdentity.isConfigured;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(200)]],
    workspaceName: ['', [Validators.required, Validators.maxLength(150)]],
    workspaceEmail: ['', [Validators.email, Validators.maxLength(200)]],
    workspaceType: ['Business', [Validators.required]],
    profileType: ['Business', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';
    const value = this.form.getRawValue();

    this.auth
      .register({
        ...value,
        workspaceEmail: value.workspaceEmail.trim() || null,
      })
      .subscribe({
        next: (response) => {
          if (response.session) {
            void this.router.navigateByUrl('/app/dashboard');
            return;
          }

          this.message = response.message;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo crear la cuenta.';
          this.loading = false;
        },
      });
  }

  signUpWithGoogle(): void {
    if (this.googleLoading || !this.googleConfigured) {
      this.error = 'Google aun no esta configurado.';
      return;
    }

    this.googleLoading = true;
    this.error = '';
    this.message = '';
    const value = this.form.getRawValue();

    this.googleIdentity
      .signIn()
      .pipe(
        switchMap((idToken) =>
          this.auth.loginWithGoogle({
            idToken,
            workspaceName: value.workspaceName.trim() || null,
            workspaceEmail: value.workspaceEmail.trim() || value.email.trim() || null,
            workspaceType: value.workspaceType,
            profileType: value.profileType,
          }),
        ),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/app/dashboard'),
        error: () => {
          this.error = 'No se pudo completar el registro con Google.';
          this.googleLoading = false;
        },
      });
  }
}
