'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { PostCard } from '@/components/post-card';
import { useSession } from '@/providers/session-provider';

export default function ProfilePage() {
  const { snapshot } = useSession();
  const [segment, setSegment] = useState<'paylasimlar' | 'ilanlar' | 'kaydedilenler'>('paylasimlar');
  if (!snapshot) return null;

  const filtered = useMemo(() => {
    if (segment === 'ilanlar') {
      return snapshot.posts.filter((post) => post.handle === snapshot.profile.handle && post.type === 'listing');
    }
    if (segment === 'kaydedilenler') {
      return snapshot.posts.filter((post) => post.savedByUser);
    }
    return snapshot.posts.filter((post) => post.handle === snapshot.profile.handle && post.type === 'standard');
  }, [segment, snapshot.posts, snapshot.profile.handle]);

  return (
    <>
      <section className="profile-cover">
        <div className="profile-hero-content">
          <div className="avatar-ring">
            {snapshot.profile.avatarUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={snapshot.profile.avatarUri} alt={snapshot.profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <strong style={{ fontSize: 28 }}>{snapshot.profile.name.slice(0, 1)}</strong>
            )}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{snapshot.profile.name}</h1>
            <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.72)' }}>{snapshot.profile.handle}</div>
          </div>
          <p style={{ maxWidth: 720, margin: 0, color: 'rgba(255,255,255,0.78)' }}>{snapshot.profile.bio}</p>
          <div className="post-actions">
            <span className="tag">{snapshot.profile.followers} takipçi</span>
            <span className="tag">{snapshot.profile.following} takip</span>
            <span className="tag">{snapshot.profile.soldListings || 0} satılan araç</span>
            <Link className="button button-secondary" href="/profile/edit">
              Profili düzenle
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 18 }}>
        <div className="post-actions">
          <button className={`button ${segment === 'paylasimlar' ? 'button-primary' : 'button-secondary'}`} onClick={() => setSegment('paylasimlar')}>
            Paylaşımlar
          </button>
          <button className={`button ${segment === 'ilanlar' ? 'button-primary' : 'button-secondary'}`} onClick={() => setSegment('ilanlar')}>
            İlanlar
          </button>
          <button className={`button ${segment === 'kaydedilenler' ? 'button-primary' : 'button-secondary'}`} onClick={() => setSegment('kaydedilenler')}>
            Kaydedilenler
          </button>
          <Link className="button button-ghost" href={`/profile/${snapshot.profile.handle.replace(/^@/, '')}/followers`}>
            Takip listeleri
          </Link>
        </div>
      </section>

      {filtered.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
