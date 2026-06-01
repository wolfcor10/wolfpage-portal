import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-confirm-email',
  imports: [RouterLink],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  loading = true;
  succeeded = false;
  message = 'Confirming your email...';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.succeeded = false;
      this.message = 'Missing confirmation token.';
      return;
    }

    this.auth.confirmEmail({ token }).pipe(timeout(15000)).subscribe({
      next: (response) => {
        this.loading = false;
        this.succeeded = response.succeeded;
        this.message = response.message;
      },
      error: () => {
        this.loading = false;
        this.succeeded = false;
        this.message = 'The confirmation link could not be validated. Check that the API is running.';
      },
    });
  }
}
