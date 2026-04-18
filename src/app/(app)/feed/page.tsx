'use client';

import { ComposerCard } from '@/components/composer-card';
import { PostCard } from '@/components/post-card';
import { useSession } from '@/providers/session-provider';

export default function FeedPage() {
  const { snapshot, runSnapshotAction } = useSession();
  if (!snapshot) return null;

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Sosyal Akış</div>
          <h1 style={{ margin: '8px 0 6px' }}>Carloi masaüstü feed</h1>
          <p className="muted" style={{ margin: 0 }}>
            Geniş medya alanı, listing kartları ve masaüstü için optimize edilmiş üç kolon deneyimi.
          </p>
        </div>
      </section>

      <ComposerCard />

      {snapshot.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          actions={
            <>
              <button className="button button-secondary" onClick={() => runSnapshotAction(`/api/posts/${post.id}/like`, { method: 'POST' })}>
                {post.likedByUser ? 'Beğeniden çıkar' : 'Beğen'}
              </button>
              <button className="button button-secondary" onClick={() => runSnapshotAction(`/api/posts/${post.id}/save`, { method: 'POST' })}>
                {post.savedByUser ? 'Kaydı kaldır' : 'Kaydet'}
              </button>
              <button className="button button-secondary" onClick={() => runSnapshotAction(`/api/posts/${post.id}/repost`, { method: 'POST' })}>
                Repost
              </button>
            </>
          }
        />
      ))}
    </>
  );
}
