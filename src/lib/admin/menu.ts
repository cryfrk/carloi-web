import { hasAdminRole, type AdminRoleKey } from '@/lib/admin/roles';

export interface AdminMenuItem {
  href: string;
  label: string;
  description: string;
  visibleTo: AdminRoleKey[];
}

export const adminMenu: AdminMenuItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    description: 'Operasyon ozeti, buyume ve inceleme kuyruklari.',
    visibleTo: [
      'super_admin',
      'compliance_admin',
      'moderation_admin',
      'support_admin',
      'billing_admin',
      'analytics_admin',
      'ops_admin',
    ],
  },
  {
    href: '/admin/users',
    label: 'Users',
    description: 'Kullanici profilleri, statuler ve davranis sinyalleri.',
    visibleTo: ['super_admin', 'support_admin', 'compliance_admin'],
  },
  {
    href: '/admin/commercial',
    label: 'Commercial',
    description: 'Ticari hesap basvurulari ve belge incelemeleri.',
    visibleTo: ['super_admin', 'compliance_admin'],
  },
  {
    href: '/admin/listings',
    label: 'Listings',
    description: 'Ilan uyumlulugu, plaka cakismalari ve kisitlar.',
    visibleTo: ['super_admin', 'compliance_admin', 'moderation_admin', 'ops_admin'],
  },
  {
    href: '/admin/posts',
    label: 'Posts',
    description: 'Sosyal icerik moderasyonu ve kaldirma kayitlari.',
    visibleTo: ['super_admin', 'moderation_admin', 'ops_admin'],
  },
  {
    href: '/admin/messages',
    label: 'Messages',
    description: 'Mesaj metadata, retention ve delil erisim politikasi.',
    visibleTo: ['super_admin', 'support_admin', 'legal_export_admin'],
  },
  {
    href: '/admin/payments',
    label: 'Payments',
    description: 'Odeme kayitlari, istisnalar ve basarisiz islemler.',
    visibleTo: ['super_admin', 'billing_admin', 'legal_export_admin'],
  },
  {
    href: '/admin/subscriptions',
    label: 'Subscriptions',
    description: 'Paketler, abonelik durumu ve ucretli ilan kurallari.',
    visibleTo: ['super_admin', 'billing_admin', 'ops_admin'],
  },
  {
    href: '/admin/insurance',
    label: 'Insurance',
    description: 'Sigorta odakli odeme ve police operasyon yuzeyi.',
    visibleTo: ['super_admin', 'billing_admin', 'ops_admin'],
  },
  {
    href: '/admin/risk',
    label: 'Risk',
    description: 'Risk skorlari, acik bayraklar ve sistem kurallari.',
    visibleTo: ['super_admin', 'compliance_admin', 'moderation_admin'],
  },
  {
    href: '/admin/audit',
    label: 'Audit',
    description: 'Audit trail, delil gecmisi ve export hazirligi.',
    visibleTo: ['super_admin', 'legal_export_admin'],
  },
  {
    href: '/admin/reports',
    label: 'Reports',
    description: 'Moderasyon, kullanici ve listing rapor kuyruklari.',
    visibleTo: ['super_admin', 'moderation_admin', 'legal_export_admin', 'ops_admin'],
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    description: 'Feature flag, rollout ve ucretlendirme anahtarlari.',
    visibleTo: ['super_admin', 'billing_admin', 'analytics_admin', 'ops_admin'],
  },
];

const dynamicAdminRouteRules: Array<{ pattern: string; visibleTo: AdminRoleKey[] }> = [
  { pattern: '/admin/users/[id]', visibleTo: ['super_admin', 'support_admin', 'compliance_admin'] },
  { pattern: '/admin/commercial/[id]', visibleTo: ['super_admin', 'compliance_admin'] },
  { pattern: '/admin/listings/[id]', visibleTo: ['super_admin', 'compliance_admin', 'moderation_admin', 'ops_admin'] },
  { pattern: '/admin/payments/[paymentId]', visibleTo: ['super_admin', 'billing_admin', 'legal_export_admin'] },
];

function normalizeAdminPath(pathname: string) {
  const normalized = String(pathname || '/admin').trim() || '/admin';
  return normalized === '/' ? '/admin' : normalized.replace(/\/+$/g, '') || '/admin';
}

function matchesPattern(pathname: string, pattern: string) {
  const normalizedPath = normalizeAdminPath(pathname);
  const normalizedPattern = normalizeAdminPath(pattern);

  if (normalizedPath === normalizedPattern) {
    return true;
  }

  const pathParts = normalizedPath.split('/').filter(Boolean);
  const patternParts = normalizedPattern.split('/').filter(Boolean);

  if (pathParts.length !== patternParts.length) {
    return false;
  }

  return patternParts.every((segment, index) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return pathParts[index].length > 0;
    }

    return segment === pathParts[index];
  });
}

export function getVisibleAdminMenu(roleKeys: string[] | undefined) {
  return adminMenu.filter((item) => hasAdminRole(roleKeys, item.visibleTo));
}

export function findFirstVisibleAdminPath(roleKeys: string[] | undefined) {
  return getVisibleAdminMenu(roleKeys)[0]?.href || '/';
}

export function canAccessAdminPath(pathname: string, roleKeys: string[] | undefined) {
  const normalizedPath = normalizeAdminPath(pathname);

  if (normalizedPath === '/admin') {
    return getVisibleAdminMenu(roleKeys).length > 0;
  }

  const candidates = [
    ...adminMenu.map((item) => ({ pattern: item.href, visibleTo: item.visibleTo })),
    ...dynamicAdminRouteRules,
  ];

  return candidates.some((rule) => matchesPattern(normalizedPath, rule.pattern) && hasAdminRole(roleKeys, rule.visibleTo));
}
