export type AdminRoleKey =
  | 'super_admin'
  | 'compliance_admin'
  | 'moderation_admin'
  | 'support_admin'
  | 'billing_admin'
  | 'analytics_admin'
  | 'legal_export_admin'
  | 'ops_admin';

export const ADMIN_PERMISSIONS = {
  dashboardRead: 'dashboard.read',
  usersRead: 'users.read',
  usersDetailRead: 'users.detail.read',
  usersSupportView: 'users.support_view',
  usersSuspend: 'users.suspend',
  usersForcePasswordReset: 'users.force_password_reset',
  commercialRead: 'commercial.read',
  commercialReview: 'commercial.review',
  commercialApprove: 'commercial.approve',
  commercialReject: 'commercial.reject',
  commercialSuspend: 'commercial.suspend',
  commercialRevoke: 'commercial.revoke',
  documentsMetadataRead: 'documents.metadata.read',
  documentsFileRead: 'documents.file.read',
  documentsReview: 'documents.review',
  listingsRead: 'listings.read',
  listingsComplianceRead: 'listings.compliance.read',
  listingsSuspend: 'listings.suspend',
  listingsReject: 'listings.reject',
  postsRead: 'posts.read',
  postsModerate: 'posts.moderate',
  reportsRead: 'reports.read',
  reportsResolve: 'reports.resolve',
  messagesMetadataRead: 'messages.metadata.read',
  messagesContentRead: 'messages.content.read',
  messagesEvidenceExport: 'messages.evidence.export',
  auditRead: 'audit.read',
  auditExport: 'audit.export',
  riskRead: 'risk.read',
  riskAnalyticsRead: 'risk.analytics.read',
  riskReview: 'risk.review',
  riskConfirm: 'risk.confirm',
  paymentsRead: 'payments.read',
  paymentsInternalRead: 'payments.internal.read',
  paymentsExport: 'payments.export',
  subscriptionsRead: 'subscriptions.read',
  subscriptionsWrite: 'subscriptions.write',
  insuranceRead: 'insurance.read',
  settingsRead: 'settings.read',
  settingsFeatureFlagsWrite: 'settings.feature_flags.write',
  analyticsRead: 'analytics.read',
} as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS] | '*';

export interface AdminRoleDefinition {
  key: AdminRoleKey;
  label: string;
  permissions: string[];
}

export const adminRoleDefinitions: AdminRoleDefinition[] = [
  { key: 'super_admin', label: 'Super Admin', permissions: ['*'] },
  {
    key: 'compliance_admin',
    label: 'Compliance Admin',
    permissions: [
      ADMIN_PERMISSIONS.dashboardRead,
      ADMIN_PERMISSIONS.usersRead,
      ADMIN_PERMISSIONS.usersDetailRead,
      ADMIN_PERMISSIONS.commercialRead,
      ADMIN_PERMISSIONS.commercialReview,
      ADMIN_PERMISSIONS.commercialApprove,
      ADMIN_PERMISSIONS.commercialReject,
      ADMIN_PERMISSIONS.commercialSuspend,
      ADMIN_PERMISSIONS.commercialRevoke,
      ADMIN_PERMISSIONS.documentsMetadataRead,
      ADMIN_PERMISSIONS.documentsFileRead,
      ADMIN_PERMISSIONS.documentsReview,
      ADMIN_PERMISSIONS.listingsRead,
      ADMIN_PERMISSIONS.listingsComplianceRead,
      ADMIN_PERMISSIONS.listingsReject,
      ADMIN_PERMISSIONS.riskRead,
      ADMIN_PERMISSIONS.riskReview,
      ADMIN_PERMISSIONS.riskConfirm,
    ],
  },
  {
    key: 'moderation_admin',
    label: 'Moderation Admin',
    permissions: [
      ADMIN_PERMISSIONS.dashboardRead,
      ADMIN_PERMISSIONS.usersRead,
      ADMIN_PERMISSIONS.usersDetailRead,
      ADMIN_PERMISSIONS.listingsRead,
      ADMIN_PERMISSIONS.listingsSuspend,
      ADMIN_PERMISSIONS.listingsReject,
      ADMIN_PERMISSIONS.postsRead,
      ADMIN_PERMISSIONS.postsModerate,
      ADMIN_PERMISSIONS.reportsRead,
      ADMIN_PERMISSIONS.reportsResolve,
      ADMIN_PERMISSIONS.riskRead,
      ADMIN_PERMISSIONS.riskReview,
      ADMIN_PERMISSIONS.messagesMetadataRead,
    ],
  },
  {
    key: 'support_admin',
    label: 'Support Admin',
    permissions: [
      ADMIN_PERMISSIONS.dashboardRead,
      ADMIN_PERMISSIONS.usersRead,
      ADMIN_PERMISSIONS.usersDetailRead,
      ADMIN_PERMISSIONS.usersSupportView,
      ADMIN_PERMISSIONS.usersForcePasswordReset,
      ADMIN_PERMISSIONS.messagesMetadataRead,
    ],
  },
  {
    key: 'billing_admin',
    label: 'Billing Admin',
    permissions: [
      ADMIN_PERMISSIONS.dashboardRead,
      ADMIN_PERMISSIONS.paymentsRead,
      ADMIN_PERMISSIONS.paymentsInternalRead,
      ADMIN_PERMISSIONS.paymentsExport,
      ADMIN_PERMISSIONS.subscriptionsRead,
      ADMIN_PERMISSIONS.subscriptionsWrite,
      ADMIN_PERMISSIONS.insuranceRead,
      ADMIN_PERMISSIONS.settingsRead,
      ADMIN_PERMISSIONS.settingsFeatureFlagsWrite,
    ],
  },
  {
    key: 'analytics_admin',
    label: 'Analytics Admin',
    permissions: [
      ADMIN_PERMISSIONS.dashboardRead,
      ADMIN_PERMISSIONS.analyticsRead,
      ADMIN_PERMISSIONS.riskAnalyticsRead,
      ADMIN_PERMISSIONS.settingsRead,
    ],
  },
  {
    key: 'legal_export_admin',
    label: 'Legal Export Admin',
    permissions: [
      ADMIN_PERMISSIONS.auditRead,
      ADMIN_PERMISSIONS.auditExport,
      ADMIN_PERMISSIONS.messagesMetadataRead,
      ADMIN_PERMISSIONS.messagesContentRead,
      ADMIN_PERMISSIONS.messagesEvidenceExport,
      ADMIN_PERMISSIONS.paymentsRead,
      ADMIN_PERMISSIONS.paymentsInternalRead,
      ADMIN_PERMISSIONS.paymentsExport,
      ADMIN_PERMISSIONS.reportsRead,
    ],
  },
  {
    key: 'ops_admin',
    label: 'Ops Admin',
    permissions: [
      ADMIN_PERMISSIONS.dashboardRead,
      ADMIN_PERMISSIONS.usersRead,
      ADMIN_PERMISSIONS.listingsRead,
      ADMIN_PERMISSIONS.postsRead,
      ADMIN_PERMISSIONS.reportsRead,
      ADMIN_PERMISSIONS.riskRead,
      ADMIN_PERMISSIONS.paymentsRead,
      ADMIN_PERMISSIONS.subscriptionsRead,
      ADMIN_PERMISSIONS.insuranceRead,
      ADMIN_PERMISSIONS.settingsRead,
      ADMIN_PERMISSIONS.analyticsRead,
    ],
  },
];

export function hasAdminRole(roleKeys: string[] | undefined, allowedRoles: AdminRoleKey[]) {
  if (!Array.isArray(roleKeys) || roleKeys.length === 0) {
    return false;
  }

  return roleKeys.some((roleKey): roleKey is AdminRoleKey => allowedRoles.includes(roleKey as AdminRoleKey));
}

export function getEffectiveAdminPermissions(roleKeys: string[] | undefined) {
  if (!Array.isArray(roleKeys) || roleKeys.length === 0) {
    return [] as AdminPermission[];
  }

  const permissions = new Set<AdminPermission>();

  for (const roleKey of roleKeys) {
    const definition = adminRoleDefinitions.find((candidate) => candidate.key === roleKey);
    for (const permission of definition?.permissions || []) {
      permissions.add(permission as AdminPermission);
    }
  }

  return Array.from(permissions);
}

export function hasAdminPermission(roleKeys: string[] | undefined, permission: string) {
  const permissions = getEffectiveAdminPermissions(roleKeys);
  return permissions.includes('*') || permissions.includes(permission as AdminPermission);
}
