import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/admin-shell';
import { getServerSnapshot } from '@/lib/backend';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getServerSnapshot();
  const adminAccess = snapshot?.admin;

  if (!snapshot?.auth.isAuthenticated) {
    redirect('/login?next=/admin');
  }

  if (!adminAccess?.isAdmin || !adminAccess.roleKeys.length) {
    redirect('/');
  }

  return <AdminShell roleKeys={adminAccess.roleKeys}>{children}</AdminShell>;
}
