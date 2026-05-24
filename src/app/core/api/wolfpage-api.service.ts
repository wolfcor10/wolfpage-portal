import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface TemplateVersionDto {
  id: string;
  versionNumber: number;
  engine?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface TemplateDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  isActive: boolean;
  createdAt: string;
  versions: TemplateVersionDto[];
}

export interface CreatePageRequest {
  workspaceId: string;
  templateVersionId: string;
  pageName: string;
  slug: string;
  content: Record<string, unknown>;
}

export interface PageRequestResponse {
  requestId: string;
  correlationId: string;
  status: string;
  pageId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  processedAt?: string | null;
}

export interface PageResponse {
  id: string;
  workspaceId: string;
  templateVersionId: string;
  requestId: string;
  title: string;
  slug: string;
  routePath: string;
  htmlContent: string;
  cssContent?: string | null;
  jsContent?: string | null;
  status: string;
  publishedUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDto {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface UserDto {
  id: string;
  workspaceId: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  roles: string[];
}

export interface WorkspaceDto {
  id: string;
  name: string;
  email: string;
  workspaceType: string;
  profileType: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface CreateWorkspaceRequest {
  name: string;
  email: string;
  workspaceType: string;
  profileType: string;
}

@Injectable({ providedIn: 'root' })
export class WolfpageApiService {
  private readonly http = inject(HttpClient);

  getTemplates(): Observable<TemplateDto[]> {
    return this.http.get<TemplateDto[]>(`${API_BASE_URL}/templates`);
  }

  getWorkspaces(): Observable<WorkspaceDto[]> {
    return this.http.get<WorkspaceDto[]>(`${API_BASE_URL}/workspaces`);
  }

  createWorkspace(request: CreateWorkspaceRequest): Observable<WorkspaceDto> {
    return this.http.post<WorkspaceDto>(`${API_BASE_URL}/workspaces`, request);
  }

  generatePage(request: CreatePageRequest): Observable<PageRequestResponse> {
    return this.http.post<PageRequestResponse>(`${API_BASE_URL}/pages/generate`, request);
  }

  getRequest(id: string): Observable<PageRequestResponse> {
    return this.http.get<PageRequestResponse>(`${API_BASE_URL}/pages/requests/${id}`);
  }

  getPages(): Observable<PageResponse[]> {
    return this.http.get<PageResponse[]>(`${API_BASE_URL}/pages`);
  }

  getPage(id: string): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${API_BASE_URL}/pages/${id}`);
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${API_BASE_URL}/users`);
  }

  createUser(request: CreateUserRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${API_BASE_URL}/users`, request);
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${API_BASE_URL}/users/roles`);
  }
}
