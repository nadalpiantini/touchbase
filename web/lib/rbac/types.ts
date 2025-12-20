/**
 * RBAC Types and Role Hierarchy
 * @module lib/rbac/types
 */

export type Role = 'owner' | 'admin' | 'coach' | 'viewer';

export interface UserOrganization {
  id: number;
  user_id: string;
  org_id: string;
  role: Role;
  invited_by: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  theme_id: number | null;
  description: string | null;
  website_url: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CurrentOrg {
  org_id: string;
  org_name: string;
  role: Role;
}

/**
 * Role hierarchy levels (lower number = higher privilege)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 1,
  admin: 2,
  coach: 3,
  viewer: 4,
} as const;

/**
 * Permission presets for common operations
 */
export const PERMISSIONS = {
  // Organization management
  CREATE_ORG: ['owner'] as Role[],
  UPDATE_ORG: ['owner', 'admin'] as Role[],
  DELETE_ORG: ['owner'] as Role[],
  VIEW_ORG: ['owner', 'admin', 'coach', 'viewer'] as Role[],

  // User management
  INVITE_USERS: ['owner', 'admin'] as Role[],
  REMOVE_USERS: ['owner', 'admin'] as Role[],
  UPDATE_ROLES: ['owner', 'admin'] as Role[],
  VIEW_USERS: ['owner', 'admin', 'coach'] as Role[],

  // Theme management
  MANAGE_THEME: ['owner', 'admin'] as Role[],
  VIEW_THEME: ['owner', 'admin', 'coach', 'viewer'] as Role[],

  // Content management (classes, modules, etc.)
  CREATE_CONTENT: ['owner', 'admin', 'coach'] as Role[],
  UPDATE_CONTENT: ['owner', 'admin', 'coach'] as Role[],
  DELETE_CONTENT: ['owner', 'admin'] as Role[],
  VIEW_CONTENT: ['owner', 'admin', 'coach', 'viewer'] as Role[],

  // Analytics and reports
  VIEW_ANALYTICS: ['owner', 'admin'] as Role[],
  EXPORT_DATA: ['owner', 'admin'] as Role[],
} as const;
