import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  TemplateDto,
  TemplateVersionDto,
  WolfpageApiService,
} from '../../../core/api/wolfpage-api.service';
import { AuthService } from '../../../core/auth/auth.service';

interface TemplateVersionOption {
  template: TemplateDto;
  version: TemplateVersionDto;
}

@Component({
  selector: 'app-page-create',
  imports: [ReactiveFormsModule],
  templateUrl: './page-create.component.html',
})
export class PageCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(WolfpageApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  options: TemplateVersionOption[] = [];
  loadingTemplates = true;
  submitting = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    templateVersionId: ['', Validators.required],
    pageName: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    contentJson: [
      JSON.stringify(
        {
          title: 'Mi negocio',
          heroText: 'Servicios listos para publicar',
          phone: '3001234567',
          address: 'Calle 123',
        },
        null,
        2,
      ),
      Validators.required,
    ],
  });

  ngOnInit(): void {
    this.api.getTemplates().subscribe({
      next: (templates) => {
        this.options = templates.flatMap((template) =>
          template.versions.map((version) => ({ template, version })),
        );
        this.loadingTemplates = false;
      },
      error: () => {
        this.error = 'No fue posible cargar templates.';
        this.loadingTemplates = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const tenantId = this.auth.currentUser?.tenantId;
    if (!tenantId) {
      this.error = 'Sesion sin tenant.';
      return;
    }

    let content: Record<string, unknown>;
    try {
      content = JSON.parse(this.form.controls.contentJson.value) as Record<string, unknown>;
    } catch {
      this.error = 'El contenido debe ser JSON valido.';
      return;
    }

    this.submitting = true;
    this.error = '';

    this.api
      .generatePage({
        tenantId,
        templateVersionId: this.form.controls.templateVersionId.value,
        pageName: this.form.controls.pageName.value.trim(),
        slug: this.form.controls.slug.value.trim(),
        content,
      })
      .subscribe({
        next: (request) => void this.router.navigate(['/app/requests', request.requestId]),
        error: () => {
          this.error = 'No fue posible crear la solicitud.';
          this.submitting = false;
        },
      });
  }
}
