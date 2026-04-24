import { redirect } from 'next/navigation';

import { findFirstVisibleAdminPath } from '@/lib/admin/menu';
import { getServerSnapshot } from '@/lib/backend';

export default async function AdminIndexPage() {
  const snapshot = await getServerSnapshot();
  const fallbackPath = findFirstVisibleAdminPath(snapshot?.admin?.roleKeys);

  redirect(fallbackPath || '/');
}
