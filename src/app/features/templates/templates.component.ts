import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TemplateDto, WolfpageApiService } from '../../core/api/wolfpage-api.service';

@Component({
  selector: 'app-templates',
  imports: [RouterLink],
  templateUrl: './templates.component.html',
})
export class TemplatesComponent implements OnInit {
  private readonly api = inject(WolfpageApiService);

  templates: TemplateDto[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar templates.';
        this.loading = false;
      },
    });
  }
}
