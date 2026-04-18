import Link from 'next/link';

import { formatCompactNumber, formatDateTime } from '@/lib/format';
import type { Post } from '@/lib/types';

export function PostCard({
  post,
  actions,
  compact = false,
}: {
  post: Post;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  const firstMedia = post.media.filter((item) => item.uri);

  return (
    <article className="glass-card feed-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <strong>{post.authorName}</strong>
            <span className="muted">{post.handle}</span>
            <span className="tag">{post.type === 'listing' ? 'İlan' : 'Gönderi'}</span>
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            {post.lastEditedAt ? `Düzenlendi · ${formatDateTime(post.lastEditedAt)}` : formatDateTime(post.createdAt)}
          </div>
        </div>
        <div className="post-actions">{actions}</div>
      </div>

      {post.content ? <p style={{ margin: 0, lineHeight: 1.7 }}>{post.content}</p> : null}

      {post.listing ? (
        <div className="soft-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
            <div>
              <div className="eyebrow">Araç İlanı</div>
              <h3 style={{ margin: '8px 0 6px' }}>{post.listing.title}</h3>
              <strong style={{ fontSize: '1.3rem' }}>{post.listing.price}</strong>
            </div>
            <Link className="button button-secondary" href={`/listing/${post.id}`}>
              Detay gör
            </Link>
          </div>
          <div className="metrics-grid" style={{ marginTop: 14 }}>
            <div className="metric-card">
              <div className="muted">Konum</div>
              <strong>{post.listing.location}</strong>
            </div>
            <div className="metric-card">
              <div className="muted">Paket</div>
              <strong>{post.listing.specTable.find((item) => item.label === 'Paket')?.value || '-'}</strong>
            </div>
            <div className="metric-card">
              <div className="muted">Motor</div>
              <strong>{post.listing.specTable.find((item) => item.label === 'Motor')?.value || '-'}</strong>
            </div>
          </div>
        </div>
      ) : null}

      {firstMedia.length ? (
        <div className={compact ? 'feed-media' : 'feed-media feed-media-grid'}>
          {(compact ? firstMedia.slice(0, 1) : firstMedia.slice(0, 4)).map((media) => (
            <div key={media.id} className="feed-media-item">
              {media.uri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.uri}
                  alt={media.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="post-actions">
        <span className="tag">Beğeni {formatCompactNumber(post.likes)}</span>
        <span className="tag">Yorum {formatCompactNumber(post.comments)}</span>
        <span className="tag">Repost {formatCompactNumber(post.reposts)}</span>
        <span className="tag">Görüntülenme {formatCompactNumber(post.views)}</span>
        <Link className="tag" href={post.type === 'listing' ? `/listing/${post.id}` : `/p/${post.id}`}>
          Aç
        </Link>
      </div>
    </article>
  );
}
