import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageResponse, WolfpageApiService } from '../../../core/api/wolfpage-api.service';

@Component({
  selector: 'app-page-detail',
  imports: [RouterLink],
  templateUrl: './page-detail.component.html',
  styleUrl: './page-detail.component.scss',
})
export class PageDetailComponent implements OnInit {
  private readonly api = inject(WolfpageApiService);
  private readonly route = inject(ActivatedRoute);

  page?: PageResponse;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Pagina no encontrada.';
      return;
    }

    this.api.getPage(id).subscribe({
      next: (page) => (this.page = page),
      error: () => (this.error = 'No fue posible cargar la pagina.'),
    });
  }
}
