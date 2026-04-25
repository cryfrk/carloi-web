'use client';

import { ComposerCard } from '@/components/composer-card';
import { PostCard } from '@/components/post-card';
import { useSession } from '@/providers/session-provider';

export default function FeedPage() {
  const { snapshot, runSnapshotAction } = useSession();
  if (!snapshot) return null;

  return (
    <>
      <section className="glass-card page-header feed-hero">
        <div>
          <div className="eyebrow">Ana akis</div>
          <h1>Carloi social feed</h1>
          <p className="muted">
            Sosyal gonderiler, listing kartlari ve hizli sohbet aksiyonlari ayni akis icinde
            toplanir.
          </p>
        </div>
        <div className="hero-stats">
          <span className="tag">{snapshot.posts.length} yayin</span>
          <span className="tag">{snapshot.conversations.length} aktif sohbet</span>
          <span className="tag">{snapshot.commercial.commercialStatus}</span>
        </div>
      </section>

      <ComposerCard />

      <div className="stack">
        {snapshot.posts.length ? (
          snapshot.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              actions={
                <>
                  <button
                    className="button button-secondary"
                    onClick={() => runSnapshotAction(`/api/posts/${post.id}/like`, { method: 'POST' })}
                    type="button"
                  >
                    {post.likedByUser ? 'Begeniyi kaldir' : 'Begen'}
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => runSnapshotAction(`/api/posts/${post.id}/save`, { method: 'POST' })}
                    type="button"
                  >
                    {post.savedByUser ? 'Kaydi kaldir' : 'Kaydet'}
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => runSnapshotAction(`/api/posts/${post.id}/repost`, { method: 'POST' })}
                    type="button"
                  >
                    Paylas
                  </button>
                </>
              }
            />
          ))
        ) : (
          <section className="empty-state soft-card">
            <strong>Feed henuz bos.</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Ilk gonderinizi veya ilk listinginizi yukaridaki composer kartindan paylasabilirsiniz.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
