export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  permissions: string[];
}

export interface PermissionItem {
  code: string;
  label: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  items: PermissionItem[];
}

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export interface UpdateRolePermissionsInput {
  permissions: string[];
}
