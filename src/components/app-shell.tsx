'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { formatCompactNumber } from '@/lib/format';
import type { AppSnapshot } from '@/lib/types';
import { useSession } from '@/providers/session-provider';

const navItems = [
  { href: '/feed', label: 'Akış' },
  { href: '/search', label: 'Keşfet' },
  { href: '/messages', label: 'Mesajlar' },
  { href: '/ai', label: 'Loi AI' },
  { href: '/profile', label: 'Profil' },
  { href: '/settings', label: 'Ayarlar' },
];

export function AppShell({
  snapshot: initialSnapshot,
  children,
}: {
  snapshot: AppSnapshot;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, snapshot } = useSession();
  const activeSnapshot = snapshot || initialSnapshot;

  return (
    <div className="page-shell">
      <div className="app-frame">
        <aside className="sidebar glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image src="/carloi.png" alt="Carloi" width={38} height={38} />
            <div>
              <div className="eyebrow">Carloi</div>
              <strong>Web Companion</strong>
            </div>
          </div>

          <div className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx('sidebar-link', pathname === item.href && 'active')}
              >
                <span>{item.label}</span>
                <span className="muted">→</span>
              </Link>
            ))}
          </div>

          <div className="soft-card" style={{ padding: 18, marginTop: 24 }}>
            <div className="muted" style={{ marginBottom: 6 }}>
              {activeSnapshot.profile.handle}
            </div>
            <strong>{activeSnapshot.profile.name}</strong>
            <div className="metrics-grid" style={{ marginTop: 14 }}>
              <div className="metric-card">
                <div className="muted">Takipçi</div>
                <strong>{formatCompactNumber(activeSnapshot.profile.followers)}</strong>
              </div>
              <div className="metric-card">
                <div className="muted">İlan / Paylaşım</div>
                <strong>{formatCompactNumber(activeSnapshot.profile.posts)}</strong>
              </div>
            </div>
            <button
              className="button button-ghost"
              style={{ width: '100%', marginTop: 14 }}
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
            >
              Oturumu kapat
            </button>
          </div>
        </aside>

        <main className="main-column">{children}</main>

        <aside className="right-rail">
          <div className="glass-card" style={{ padding: 22 }}>
            <div className="eyebrow">Hızlı Özet</div>
            <h3 style={{ marginTop: 10 }}>Bugün Carloi’de neler var?</h3>
            <div className="helper-grid" style={{ marginTop: 16 }}>
              <div className="metric-card">
                <div className="muted">Toplam gönderi</div>
                <strong>{formatCompactNumber(activeSnapshot.posts.length)}</strong>
              </div>
              <div className="metric-card">
                <div className="muted">Açık sohbet</div>
                <strong>{formatCompactNumber(activeSnapshot.conversations.length)}</strong>
              </div>
              <div className="metric-card">
                <div className="muted">Loi AI geçmişi</div>
                <strong>{formatCompactNumber(activeSnapshot.aiMessages.length)}</strong>
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: 22 }}>
            <div className="eyebrow">Aracım</div>
            <h3 style={{ marginTop: 10 }}>
              {activeSnapshot.vehicle
                ? `${activeSnapshot.vehicle.year} ${activeSnapshot.vehicle.brand} ${activeSnapshot.vehicle.model}`
                : 'Araç profili eklenmedi'}
            </h3>
            <p className="muted">
              {activeSnapshot.vehicle
                ? activeSnapshot.vehicle.summary
                : 'Araç profilinizi web üzerinden de güncelleyip ilanlarda otomatik kullanabilirsiniz.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
