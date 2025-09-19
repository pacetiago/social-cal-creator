import { UserRole, Permission, hasPermission as checkPermission } from '@/types/multi-tenant';

export class RBACError extends Error {
  constructor(message: string, public requiredRole?: UserRole, public requiredPermission?: Permission) {
    super(message);
    this.name = 'RBACError';
  }
}

export function requireRole(userRole: UserRole | undefined, requiredRole: UserRole | UserRole[]): void {
  if (!userRole) {
    throw new RBACError('User role is required');
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  if (!allowedRoles.includes(userRole)) {
    throw new RBACError(
      `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}`,
      Array.isArray(requiredRole) ? requiredRole[0] : requiredRole
    );
  }
}

export function requirePermission(userRole: UserRole | undefined, permission: Permission): void {
  if (!userRole) {
    throw new RBACError('User role is required for permission check');
  }

  if (!checkPermission(userRole, permission)) {
    throw new RBACError(
      `Access denied. Missing permission: ${permission}. Your role: ${userRole}`,
      undefined,
      permission
    );
  }
}

export function hasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  return checkPermission(userRole, permission);
}

export function hasAnyRole(userRole: UserRole | undefined, roles: UserRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

export function isPlatformAdmin(userClaims?: { role?: string }): boolean {
  return userClaims?.role === 'platform_admin';
}

export function canAccessOrg(membership: { role: UserRole } | null): boolean {
  return !!membership;
}

export function getHighestRole(memberships: { role: UserRole }[]): UserRole | null {
  if (memberships.length === 0) return null;
  
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    EDITOR: 2,
    ADMIN: 3,
    OWNER: 4
  };

  return memberships.reduce((highest, current) => {
    return roleHierarchy[current.role] > roleHierarchy[highest] ? current.role : highest;
  }, memberships[0].role);
}