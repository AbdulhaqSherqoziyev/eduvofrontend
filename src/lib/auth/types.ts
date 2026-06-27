/** Auth/session types — mirror the JWT payload issued by the backend. */

export interface SessionUser {
  userId?: string;
  tenantId?: string;
  fullName: string;
  permissions: string[];
  isSuperAdmin?: boolean;
  defaultRole?: string;
  mustChangePassword?: boolean;
  // Platform OWNER (ICAN) — logs in at the same URL, routed to the owner panel.
  isPlatform?: boolean;
  isOwner?: boolean;
  platformUserId?: string;
  // Set when an OWNER is "logged in as" this tenant user (the eye / login-as).
  impersonated?: boolean;
}

export interface Session {
  accessToken: string;
  user: SessionUser;
}

export interface LoginInput {
  phone: string;
  password: string;
}
