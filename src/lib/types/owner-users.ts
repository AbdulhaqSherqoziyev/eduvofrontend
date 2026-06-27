/** OWNER cross-tenant user management types. */

export interface OwnerUser {
  id: string;
  tenantId: string;
  centerName: string;
  archived: boolean;
  fullName: string;
  phone: string;
  isSuperAdmin: boolean;
  defaultRole: string;
  mustChangePassword: boolean;
  roles: { id: string; name: string }[];
  createdAt: string;
}

export interface TenantRole {
  id: string;
  name: string;
}

export interface CreateOwnerUserInput {
  tenantId: string;
  fullName: string;
  phone: string;
  password: string;
  defaultRole?: string;
  roleIds?: string[];
}

export interface UpdateOwnerUserInput {
  fullName?: string;
  phone?: string;
  defaultRole?: string;
  roleIds?: string[];
}
