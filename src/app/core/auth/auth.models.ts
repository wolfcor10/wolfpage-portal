export interface LoginRequest {
  email: string;
  password: string;
  workspaceId?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  workspaceName: string;
  workspaceEmail?: string | null;
  workspaceType: string;
  profileType: string;
}

export interface RegisterResponse {
  requiresEmailConfirmation: boolean;
  emailConfirmationSent: boolean;
  message: string;
  session?: LoginResponse | null;
}

export interface ConfirmEmailRequest {
  token: string;
}

export interface EmailConfirmationResponse {
  succeeded: boolean;
  message: string;
}

export interface ResendEmailConfirmationRequest {
  email: string;
}

export interface GoogleAuthRequest {
  idToken: string;
  workspaceName?: string | null;
  workspaceEmail?: string | null;
  workspaceType: string;
  profileType: string;
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
