/** Staff (employee) + own-profile types — mirror the backend user module. */

export interface StaffRole {
  id: string;
  name: string;
}

export interface Staff {
  id: string;
  fullName: string;
  phone: string;
  isSuperAdmin: boolean;
  defaultRole: string;
  mustChangePassword: boolean;
  roles: StaffRole[];
  createdAt: string;
}

export interface CreateStaffInput {
  fullName: string;
  phone: string;
  password: string;
  defaultRole?: string;
  roleIds?: string[];
}

export interface UpdateStaffInput {
  fullName?: string;
  phone?: string;
  defaultRole?: string;
  roleIds?: string[];
}

export interface Profile {
  id: string;
  fullName: string;
  phone: string;
  defaultRole: string;
  mustChangePassword: boolean;
}
