import Link from 'next/link';

import { formatCompactNumber, formatDateTime } from '@/lib/format';
import type { Post } from '@/lib/types';

function readListingFact(post: Post, label: string) {
  return post.listing?.specTable?.find((item) => item.label === label)?.value || '-';
}

export function PostCard({
  post,
  actions,
  compact = false,
}: {
  post: Post;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  const media = Array.isArray(post.media) ? post.media.filter((item) => item?.uri) : [];
  const listing = post.listing;
  const detailHref = post.type === 'listing' ? `/listing/${post.id}` : `/p/${post.id}`;

  return (
    <article className="post-card">
      <header className="post-card-header">
        <div className="post-author">
          <div className="post-avatar">
            {post.authorAvatarUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.authorAvatarUri} alt={post.authorName} />
            ) : (
              <span>{post.authorName.slice(0, 1)}</span>
            )}
          </div>
          <div className="stack" style={{ gap: 4 }}>
            <div className="post-author-line">
              <strong>{post.authorName}</strong>
              <span className="muted">{post.handle}</span>
              <span className="tag">{post.type === 'listing' ? 'Listing' : 'Gonderi'}</span>
            </div>
            <div className="muted">
              {post.lastEditedAt
                ? `Duzenlendi · ${formatDateTime(post.lastEditedAt)}`
                : formatDateTime(post.createdAt)}
            </div>
          </div>
        </div>
        {actions ? <div className="post-actions">{actions}</div> : null}
      </header>

      {post.content ? <p className="post-copy">{post.content}</p> : null}

      {listing ? (
        <section className="listing-inline-card">
          <div className="listing-inline-header">
            <div className="stack" style={{ gap: 6 }}>
              <div className="eyebrow">Carloi listing karti</div>
              <h3>{listing.title}</h3>
              <div className="listing-inline-price">{listing.price}</div>
            </div>
            <div className="listing-inline-badges">
              <span className="tag">{listing.location}</span>
              {listing.riskLevel ? <span className="tag">Risk: {listing.riskLevel}</span> : null}
            </div>
          </div>

          <div className="listing-inline-grid">
            <div className="metric-card">
              <div className="muted">Paket</div>
              <strong>{readListingFact(post, 'Paket')}</strong>
            </div>
            <div className="metric-card">
              <div className="muted">Motor</div>
              <strong>{readListingFact(post, 'Motor')}</strong>
            </div>
            <div className="metric-card">
              <div className="muted">Ozet</div>
              <strong>{listing.summaryLine || '-'}</strong>
            </div>
          </div>

          <div className="post-actions">
            <Link className="button button-secondary" href={detailHref}>
              Detayi ac
            </Link>
            {listing.contactPhone ? <span className="tag">Iletisim: {listing.contactPhone}</span> : null}
            {listing.sellerHandle ? <span className="tag">Satici: {listing.sellerHandle}</span> : null}
          </div>
        </section>
      ) : null}

      {media.length ? (
        <div className={compact ? 'feed-media' : 'feed-media feed-media-grid'}>
          {(compact ? media.slice(0, 1) : media.slice(0, 4)).map((item) => (
            <div key={item.id} className="feed-media-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.uri} alt={item.label} />
            </div>
          ))}
        </div>
      ) : null}

      <footer className="post-card-footer">
        <span className="tag">Begeni {formatCompactNumber(post.likes)}</span>
        <span className="tag">Yorum {formatCompactNumber(post.comments)}</span>
        <span className="tag">Paylasim {formatCompactNumber(post.reposts)}</span>
        <span className="tag">Goruntuleme {formatCompactNumber(post.views)}</span>
        <Link className="tag" href={detailHref}>
          Ac
        </Link>
      </footer>
    </article>
  );
}
