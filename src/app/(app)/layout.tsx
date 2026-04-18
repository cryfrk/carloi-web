import { redirect } from 'next/navigation';

import { AppShell } from '@/components/app-shell';
import { getServerSnapshot } from '@/lib/backend';
import { SessionProvider } from '@/providers/session-provider';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getServerSnapshot();
  if (!snapshot) {
    redirect('/login');
  }

  return (
    <SessionProvider initialSnapshot={snapshot}>
      <AppShell snapshot={snapshot}>{children}</AppShell>
    </SessionProvider>
  );
}
