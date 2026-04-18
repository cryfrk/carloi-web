import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/post-card';
import { getPublicListing } from '@/lib/backend';
import { webEnv } from '@/lib/env';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const post = await getPublicListing(id);
    if (!post?.listing) {
      return {};
    }

    return {
      title: `${post.listing.title} · Carloi İlan`,
      description: `${post.listing.price} · ${post.listing.location} · ${post.listing.summaryLine}`,
      openGraph: {
        title: `${post.listing.title} · Carloi`,
        description: `${post.listing.price} · ${post.listing.location}`,
        images: [post.media.find((item) => item.uri)?.uri || `${webEnv.shareBaseUrl}/carloi.png`],
      },
    };
  } catch {
    return {};
  }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPublicListing(id);
  if (!post?.listing) {
    notFound();
  }

  const listing = post.listing;

  return (
    <main className="page-shell public-layout">
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Carloi İlanı</div>
          <h1 style={{ margin: '8px 0 6px' }}>{listing.title}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {listing.price} · {listing.location}
          </p>
        </div>
        <Link className="button button-primary" href="/register">
          İlan sahibine ulaş
        </Link>
      </section>

      <PostCard post={post} compact />

      <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 18 }}>
        <div className="two-up">
          <div className="soft-card" style={{ padding: 18 }}>
            <div className="eyebrow">Fabrika & araç</div>
            <div className="stack" style={{ marginTop: 12 }}>
              {listing.specTable.map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <span className="muted">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="soft-card" style={{ padding: 18 }}>
            <div className="eyebrow">Durum & detay</div>
            <div className="stack" style={{ marginTop: 12 }}>
              {listing.conditionTable.map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <span className="muted">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="support-grid">
          {listing.equipment.map((item) => (
            <div key={item} className="tag">
              {item}
            </div>
          ))}
          {listing.extraEquipment ? <div className="tag">{listing.extraEquipment}</div> : null}
        </div>
      </section>
    </main>
  );
}
