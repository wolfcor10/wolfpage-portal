import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageResponse, WolfpageApiService } from '../../../core/api/wolfpage-api.service';

@Component({
  selector: 'app-pages-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './pages-list.component.html',
})
export class PagesListComponent implements OnInit {
  private readonly api = inject(WolfpageApiService);

  pages: PageResponse[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.getPages().subscribe({
      next: (pages) => {
        this.pages = pages;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar paginas.';
        this.loading = false;
      },
    });
  }
}
