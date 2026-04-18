import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getPublicProfile } from '@/lib/backend';

export default async function FollowingPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const payload = await getPublicProfile(handle).catch(() => null);
  if (!payload) notFound();

  return (
    <main className="page-shell public-layout">
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Takip edilenler</div>
          <h1 style={{ margin: '8px 0 6px' }}>{payload.profile.name}</h1>
        </div>
        <Link className="button button-secondary" href={`/profile/${handle}`}>
          Profile dön
        </Link>
      </section>
      <section className="glass-card" style={{ padding: 22 }}>
        <div className="support-grid">
          {payload.following.map((user) => (
            <Link key={user.id} href={`/profile/${user.handle.replace(/^@/, '')}`} className="support-card">
              <strong>{user.name}</strong>
              <div className="muted" style={{ marginTop: 6 }}>
                {user.handle}
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>
                {user.note}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
