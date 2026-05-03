import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageResponse, TemplateDto, WolfpageApiService } from '../../core/api/wolfpage-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
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
}
