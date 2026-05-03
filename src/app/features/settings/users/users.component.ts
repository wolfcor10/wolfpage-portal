import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  RoleDto,
  UserDto,
  WolfpageApiService,
} from '../../../core/api/wolfpage-api.service';

@Component({
  selector: 'app-users',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private readonly api = inject(WolfpageApiService);
  private readonly fb = inject(FormBuilder);

  users: UserDto[] = [];
  roles: RoleDto[] = [];
  loading = true;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roles: [['viewer'], Validators.required],
  });

  ngOnInit(): void {
    this.load();
    this.api.getRoles().subscribe((roles) => (this.roles = roles));
  }

  create(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    this.api.createUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ fullName: '', email: '', password: '', roles: ['viewer'] });
        this.saving = false;
        this.load();
      },
      error: () => {
        this.error = 'No fue posible crear el usuario.';
        this.saving = false;
      },
    });
  }

  private load(): void {
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar usuarios.';
        this.loading = false;
      },
    });
  }
}
