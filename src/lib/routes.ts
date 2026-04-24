export interface RouteDefinition {
  path: string;
  title: string;
  group: 'public' | 'auth' | 'app' | 'admin';
  description: string;
}

export const webRouteMap: RouteDefinition[] = [
  {
    path: '/',
    title: 'Landing',
    group: 'public',
    description: 'Carloi web landing ve ürün giriş yüzeyi.',
  },
  {
    path: '/login',
    title: 'Login',
    group: 'auth',
    description: 'Mevcut backend auth akışı ile giriş.',
  },
  {
    path: '/register',
    title: 'Register',
    group: 'auth',
    description: 'Hesap oluşturma ve email verification başlangıç noktası.',
  },
  {
    path: '/verify-email',
    title: 'Verify Email',
    group: 'auth',
    description: 'Token bazlı email doğrulama yüzeyi.',
  },
  {
    path: '/forgot-password',
    title: 'Forgot Password',
    group: 'auth',
    description: 'Şifre sıfırlama talebi formu.',
  },
  {
    path: '/reset-password',
    title: 'Reset Password',
    group: 'auth',
    description: 'Token veya legacy code ile şifre yenileme ekranı.',
  },
  {
    path: '/feed',
    title: 'Feed',
    group: 'app',
    description: 'Sosyal akış ve listing paylaşımları.',
  },
  {
    path: '/search',
    title: 'Search',
    group: 'app',
    description: 'Kullanıcı ve listing keşif yüzeyi.',
  },
  {
    path: '/messages',
    title: 'Messages',
    group: 'app',
    description: 'Mesajlaşma ve deal görüşmeleri.',
  },
  {
    path: '/ai',
    title: 'Loi AI',
    group: 'app',
    description: 'Araç odaklı AI yardımcı yüzeyi.',
  },
  {
    path: '/profile',
    title: 'Profile',
    group: 'app',
    description: 'Kullanıcının kendi profil ve segment ekranı.',
  },
  {
    path: '/settings',
    title: 'Settings',
    group: 'app',
    description: 'Ayarlar, destek ve ileride compliance upgrade yüzeyi.',
  },
  {
    path: '/settings/commercial',
    title: 'Commercial Upgrade',
    group: 'app',
    description: 'Ticari hesap onboarding, belge yükleme ve durum takibi yüzeyi.',
  },
  {
    path: '/profile/[handle]',
    title: 'Public Profile',
    group: 'public',
    description: 'Dış paylaşıma açık profil sayfası.',
  },
  {
    path: '/p/[postId]',
    title: 'Public Post',
    group: 'public',
    description: 'Dışarıdan paylaşılabilir post detayı.',
  },
  {
    path: '/listing/[id]',
    title: 'Public Listing',
    group: 'public',
    description: 'Dışarıdan paylaşılabilir listing detayı.',
  },
  {
    path: '/admin/dashboard',
    title: 'Admin Dashboard',
    group: 'admin',
    description: 'Compliance, billing ve risk operasyon merkezi.',
  },
  {
    path: '/admin/users',
    title: 'Admin Users',
    group: 'admin',
    description: 'User operations and status management.',
  },
  {
    path: '/admin/commercial',
    title: 'Admin Commercial',
    group: 'admin',
    description: 'Commercial onboarding review queue.',
  },
  {
    path: '/admin/commercial/[id]',
    title: 'Admin Commercial Detail',
    group: 'admin',
    description: 'Commercial application detail, document review and approve/reject/suspend/revoke actions.',
  },
  {
    path: '/admin/listings',
    title: 'Admin Listings',
    group: 'admin',
    description: 'Listing compliance and moderation.',
  },
  {
    path: '/admin/posts',
    title: 'Admin Posts',
    group: 'admin',
    description: 'Social content moderation route.',
  },
  {
    path: '/admin/messages',
    title: 'Admin Messages',
    group: 'admin',
    description: 'Evidence and retention route.',
  },
  {
    path: '/admin/payments',
    title: 'Admin Payments',
    group: 'admin',
    description: 'Payment operations route.',
  },
  {
    path: '/admin/subscriptions',
    title: 'Admin Subscriptions',
    group: 'admin',
    description: 'Plan and subscription management route.',
  },
  {
    path: '/admin/insurance',
    title: 'Admin Insurance',
    group: 'admin',
    description: 'Insurance-related payment tracking route.',
  },
  {
    path: '/admin/risk',
    title: 'Admin Risk',
    group: 'admin',
    description: 'Risk review and heuristics route.',
  },
  {
    path: '/admin/audit',
    title: 'Admin Audit',
    group: 'admin',
    description: 'Audit and evidence history route.',
  },
  {
    path: '/admin/reports',
    title: 'Admin Reports',
    group: 'admin',
    description: 'Reports and takedown queue route.',
  },
  {
    path: '/admin/settings',
    title: 'Admin Settings',
    group: 'admin',
    description: 'Rollout, flag and pricing controls route.',
  },
];
