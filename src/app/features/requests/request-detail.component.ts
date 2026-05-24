import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageRequestResponse, WolfpageApiService } from '../../core/api/wolfpage-api.service';

@Component({
  selector: 'app-request-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './request-detail.component.html',
})
export class RequestDetailComponent implements OnInit, OnDestroy {
  private readonly api = inject(WolfpageApiService);
  private readonly route = inject(ActivatedRoute);
  private timerId?: number;

  request?: PageRequestResponse;
  error = '';

  ngOnInit(): void {
    this.load();
    this.timerId = window.setInterval(() => {
      if (!this.request || ['Pending', 'Processing'].includes(this.request.status)) {
        this.load();
      }
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Solicitud no encontrada.';
      return;
    }

    this.api.getRequest(id).subscribe({
      next: (request) => (this.request = request),
      error: () => (this.error = 'No fue posible consultar la solicitud.'),
    });
  }
}
