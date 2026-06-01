import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TemplateDto, WolfpageApiService } from '../../../core/api/wolfpage-api.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-page-create',
  imports: [ReactiveFormsModule],
  templateUrl: './page-create.component.html',
  styleUrl: './page-create.component.scss',
})
export class PageCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(WolfpageApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  templates: TemplateDto[] = [];
  currentStep = 0;
  loadingTemplates = true;
  submitting = false;
  error = '';

  readonly steps = ['Negocio', 'Contenido', 'Contacto', 'Items'];

  readonly form = this.fb.nonNullable.group({
    selectedTemplateId: ['general-business', Validators.required],
    businessName: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), Validators.maxLength(150)]],
    category: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    logoUrl: ['', Validators.maxLength(500)],
    heroTitle: ['', Validators.maxLength(200)],
    heroSubtitle: ['', Validators.maxLength(500)],
    heroImageUrl: ['', Validators.maxLength(500)],
    phone: ['', Validators.maxLength(80)],
    email: ['', [Validators.email, Validators.maxLength(200)]],
    address: ['', Validators.maxLength(300)],
    whatsapp: ['', Validators.maxLength(80)],
    openingHours: ['', Validators.maxLength(300)],
    socialLinks: this.fb.nonNullable.group({
      facebook: ['', Validators.maxLength(500)],
      instagram: ['', Validators.maxLength(500)],
      tiktok: ['', Validators.maxLength(500)],
      linkedin: ['', Validators.maxLength(500)],
      website: ['', Validators.maxLength(500)],
    }),
    items: this.fb.array([this.createItemGroup()]),
  });

  get items(): FormArray {
    return this.form.controls.items;
  }

  ngOnInit(): void {
    this.api.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates.filter((template) => template.enabled);
        const firstTemplate = this.templates[0];
        if (firstTemplate) {
          this.form.controls.selectedTemplateId.setValue(firstTemplate.id);
        }
        this.loadingTemplates = false;
      },
      error: () => {
        this.error = 'No fue posible cargar templates.';
        this.loadingTemplates = false;
      },
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length === 1) {
      this.items.at(0).reset({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        category: '',
        enabled: true,
      });
      return;
    }

    this.items.removeAt(index);
  }

  goToStep(step: number): void {
    this.currentStep = Math.min(Math.max(step, 0), this.steps.length - 1);
  }

  nextStep(): void {
    this.goToStep(this.currentStep + 1);
  }

  previousStep(): void {
    this.goToStep(this.currentStep - 1);
  }

  submit(): void {
    const invalidStep = this.findFirstInvalidStep();
    if (invalidStep >= 0 || this.submitting) {
      this.form.markAllAsTouched();
      this.currentStep = invalidStep >= 0 ? invalidStep : this.currentStep;
      this.error = invalidStep >= 0
        ? `Revisa los campos de ${this.steps[invalidStep].toLowerCase()}.`
        : 'Revisa los campos obligatorios.';
      return;
    }

    const workspaceId = this.auth.getActiveWorkspaceId();
    if (!workspaceId) {
      this.error = 'Sesion sin workspace.';
      return;
    }

    const value = this.form.getRawValue();
    const hasContact = [value.email, value.phone, value.whatsapp].some((item) =>
      Boolean(item.trim()),
    );
    if (!hasContact) {
      this.error = 'Debes indicar al menos email, telefono o WhatsApp.';
      this.currentStep = 2;
      return;
    }

    const enabledItems = value.items.filter((item) => item.enabled);
    if (!enabledItems.length) {
      this.error = 'Debes dejar al menos un item habilitado.';
      this.currentStep = 3;
      return;
    }

    this.submitting = true;
    this.error = '';

    this.api
      .createPage({
        workspaceId,
        slug: this.emptyToNull(value.slug),
        businessName: value.businessName.trim(),
        category: this.emptyToNull(value.category),
        description: value.description.trim(),
        logoUrl: this.emptyToNull(value.logoUrl),
        heroTitle: value.heroTitle.trim() || value.businessName.trim(),
        heroSubtitle: this.emptyToNull(value.heroSubtitle),
        heroImageUrl: this.emptyToNull(value.heroImageUrl),
        phone: this.emptyToNull(value.phone),
        email: this.emptyToNull(value.email),
        address: this.emptyToNull(value.address),
        whatsapp: this.emptyToNull(value.whatsapp),
        openingHours: this.emptyToNull(value.openingHours),
        selectedTemplateId: value.selectedTemplateId,
        socialLinks: {
          facebook: this.emptyToNull(value.socialLinks.facebook),
          instagram: this.emptyToNull(value.socialLinks.instagram),
          tiktok: this.emptyToNull(value.socialLinks.tiktok),
          linkedin: this.emptyToNull(value.socialLinks.linkedin),
          website: this.emptyToNull(value.socialLinks.website),
        },
        items: value.items.map((item) => ({
          name: item.name.trim(),
          description: item.description.trim(),
          price: this.emptyToNull(item.price),
          imageUrl: this.emptyToNull(item.imageUrl),
          category: this.emptyToNull(item.category),
          enabled: item.enabled,
        })),
        status: 'pending_generation',
      })
      .subscribe({
        next: (request) => void this.router.navigate(['/app/requests', request.requestId]),
        error: () => {
          this.error = 'No fue posible crear la solicitud.';
          this.submitting = false;
        },
      });
  }

  private createItemGroup() {
    return this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(800)]],
      price: ['', Validators.maxLength(80)],
      imageUrl: ['', Validators.maxLength(500)],
      category: ['', Validators.maxLength(100)],
      enabled: [true],
    });
  }

  private emptyToNull(value: string): string | null {
    const normalized = value.trim();
    return normalized.length ? normalized : null;
  }

  findFirstInvalidStep(): number {
    if (
      this.form.controls.selectedTemplateId.invalid ||
      this.form.controls.slug.invalid ||
      this.form.controls.businessName.invalid ||
      this.form.controls.category.invalid ||
      this.form.controls.description.invalid ||
      this.form.controls.logoUrl.invalid
    ) {
      return 0;
    }

    if (
      this.form.controls.heroTitle.invalid ||
      this.form.controls.heroSubtitle.invalid ||
      this.form.controls.heroImageUrl.invalid
    ) {
      return 1;
    }

    if (
      this.form.controls.email.invalid ||
      this.form.controls.phone.invalid ||
      this.form.controls.address.invalid ||
      this.form.controls.whatsapp.invalid ||
      this.form.controls.openingHours.invalid ||
      this.form.controls.socialLinks.invalid
    ) {
      return 2;
    }

    if (this.items.invalid) {
      return 3;
    }

    return -1;
  }
}
