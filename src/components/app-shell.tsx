'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { formatCompactNumber } from '@/lib/format';
import type { AppSnapshot } from '@/lib/types';
import { useSession } from '@/providers/session-provider';

const navItems = [
  { href: '/feed', label: 'Ana sayfa' },
  { href: '/search', label: 'Kesfet' },
  { href: '/listings', label: 'Ilanlar' },
  { href: '/messages', label: 'Mesajlar' },
  { href: '/notifications', label: 'Bildirimler' },
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
  const highlightedListings = activeSnapshot.posts.filter((post) => post.type === 'listing').slice(0, 3);

  return (
    <div className="page-shell">
      <div className="app-frame">
        <aside className="sidebar">
          <div className="brand-card glass-card">
            <div className="brand-row">
              <Image src="/carloi.png" alt="Carloi" width={42} height={42} />
              <div>
                <div className="eyebrow">Carloi</div>
                <strong>Sosyal otomotiv paneli</strong>
              </div>
            </div>

            <nav className="sidebar-nav" aria-label="Ana gezinti">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'sidebar-link',
                    (item.href === '/feed' && pathname === '/feed') || pathname === item.href ? 'active' : '',
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="profile-mini-card">
              <div className="muted">{activeSnapshot.profile.handle}</div>
              <strong>{activeSnapshot.profile.name}</strong>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="muted">Takipci</div>
                  <strong>{formatCompactNumber(activeSnapshot.profile.followers)}</strong>
                </div>
                <div className="metric-card">
                  <div className="muted">Paylasim</div>
                  <strong>{formatCompactNumber(activeSnapshot.profile.posts)}</strong>
                </div>
              </div>
              <button
                className="button button-ghost"
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                type="button"
              >
                Oturumu kapat
              </button>
            </div>
          </div>
        </aside>

        <main className="main-column">{children}</main>

        <aside className="right-rail">
          <section className="glass-card rail-card">
            <div className="eyebrow">Trend araclar</div>
            <div className="stack" style={{ marginTop: 14 }}>
              {highlightedListings.length ? (
                highlightedListings.map((post) => (
                  <Link key={post.id} href={`/listing/${post.id}`} className="rail-link-card">
                    <strong>{post.listing?.title || post.authorName}</strong>
                    <span className="muted">{post.listing?.price || 'Ilan fiyati eklenmedi'}</span>
                    <span className="muted">{post.listing?.location || 'Konum bekleniyor'}</span>
                  </Link>
                ))
              ) : (
                <div className="soft-card">
                  <strong>Henüz öne çıkan ilan yok</strong>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    Yeni listing olusturuldugunda burada hizli oneriler gorunecek.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="glass-card rail-card">
            <div className="eyebrow">Hizli filtreler</div>
            <div className="post-actions" style={{ marginTop: 14 }}>
              <Link className="tag" href="/search?q=suv">
                SUV
              </Link>
              <Link className="tag" href="/search?q=otomatik">
                Otomatik
              </Link>
              <Link className="tag" href="/search?q=elektrikli">
                Elektrikli
              </Link>
              <Link className="tag" href="/search?q=istanbul">
                Istanbul
              </Link>
            </div>
          </section>

          <section className="glass-card rail-card">
            <div className="eyebrow">Platform ozeti</div>
            <div className="helper-grid" style={{ marginTop: 14 }}>
              <div className="metric-card">
                <div className="muted">Feed</div>
                <strong>{formatCompactNumber(activeSnapshot.posts.length)} kart</strong>
              </div>
              <div className="metric-card">
                <div className="muted">Mesajlar</div>
                <strong>{formatCompactNumber(activeSnapshot.conversations.length)} sohbet</strong>
              </div>
              <div className="metric-card">
                <div className="muted">Loi AI</div>
                <strong>{formatCompactNumber(activeSnapshot.aiMessages.length)} oturum</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
