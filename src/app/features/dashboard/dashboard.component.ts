import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageResponse, TemplateDto, WolfpageApiService } from '../../core/api/wolfpage-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(WolfpageApiService);

  templates: TemplateDto[] = [];
  pages: PageResponse[] = [];
  loading = true;

  ngOnInit(): void {
    this.api.getTemplates().subscribe((templates) => {
      this.templates = templates;
      this.loading = false;
    });

    this.api.getPages().subscribe((pages) => {
      this.pages = pages;
    });
  }

  get latestPages(): PageResponse[] {
    return this.pages.slice(0, 5);
  }

  get publishedPages(): number {
    return this.pages.filter((page) => this.normalizeStatus(page.status) === 'published').length;
  }

  get pendingPages(): number {
    return this.pages.filter((page) => {
      const status = this.normalizeStatus(page.status);
      return status === 'pending' || status === 'processing';
    }).length;
  }

  statusTone(status: string): 'ok' | 'warn' | 'danger' {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'failed') {
      return 'danger';
    }

    if (normalized === 'pending' || normalized === 'processing') {
      return 'warn';
    }

    return 'ok';
  }

  private normalizeStatus(status: string): string {
    return status.trim().toLowerCase();
  }
}
