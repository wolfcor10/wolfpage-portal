import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { GoogleIdentityService } from '../../../core/auth/google-identity.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = false;
  googleLoading = false;
  error = '';
  readonly googleConfigured = this.googleIdentity.isConfigured;

  readonly form = this.fb.nonNullable.group({
    email: ['admin@wolfpage.local', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.error = 'Credenciales invalidas.';
        this.loading = false;
      },
    });
  }

  signInWithGoogle(): void {
    if (this.googleLoading || !this.googleConfigured) {
      this.error = 'Google aun no esta configurado.';
      return;
    }

    this.googleLoading = true;
    this.error = '';

    this.googleIdentity
      .signIn()
      .pipe(
        switchMap((idToken) =>
          this.auth.loginWithGoogle({
            idToken,
            workspaceType: 'Individual',
            profileType: 'PersonalBrand',
          }),
        ),
      )
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app/dashboard';
          void this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.error = 'No se pudo iniciar sesion con Google.';
          this.googleLoading = false;
        },
      });
  }
}
