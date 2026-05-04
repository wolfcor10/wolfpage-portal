export interface LoginRequest {
  email: string;
  password: string;
  workspaceId?: string;
}

export interface CurrentUser {
  id: string;
  activeWorkspaceId?: string | null;
  email: string;
  fullName: string;
  roles: string[];
  workspaces: CurrentUserWorkspace[];
}

export interface CurrentUserWorkspace {
  id: string;
  name: string;
  email: string;
  workspaceType: string;
  profileType: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: CurrentUser;
}
