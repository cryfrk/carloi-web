import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/post-card';
import { getPublicProfile } from '@/lib/backend';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  try {
    const { handle } = await params;
    const payload = await getPublicProfile(handle);
    return {
      title: `${payload.profile.name} (${payload.profile.handle})`,
      description: payload.profile.bio || 'Carloi profil sayfası',
      openGraph: {
        title: `${payload.profile.name} · Carloi`,
        description: payload.profile.bio || 'Carloi profil sayfası',
        images: [payload.profile.coverUri || payload.profile.avatarUri || '/carloi.png'],
      },
    };
  } catch {
    return {};
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const payload = await getPublicProfile(handle).catch(() => null);

  if (!payload) {
    notFound();
  }

  return (
    <main className="page-shell public-layout">
      <section className="profile-cover">
        <div className="profile-hero-content">
          <div className="avatar-ring">
            {payload.profile.avatarUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={payload.profile.avatarUri} alt={payload.profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <strong style={{ fontSize: 28 }}>{payload.profile.name.slice(0, 1)}</strong>
            )}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{payload.profile.name}</h1>
            <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.72)' }}>{payload.profile.handle}</div>
          </div>
          <p style={{ maxWidth: 720, margin: 0, color: 'rgba(255,255,255,0.78)' }}>{payload.profile.bio}</p>
          <div className="post-actions">
            <span className="tag">{payload.profile.followers} takipçi</span>
            <span className="tag">{payload.profile.following} takip</span>
            <span className="tag">{payload.profile.posts} paylaşım</span>
            <Link className="button button-secondary" href={`/profile/${handle}/followers`}>
              Takipçiler
            </Link>
            <Link className="button button-secondary" href={`/profile/${handle}/following`}>
              Takip edilenler
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="eyebrow">Paylaşımlar</div>
        <div className="stack" style={{ marginTop: 16 }}>
          {[...payload.listings, ...payload.posts].map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
