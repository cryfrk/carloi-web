'use client';

import Link from 'next/link';

import { PostCard } from '@/components/post-card';
import { useSession } from '@/providers/session-provider';

export default function ListingsPage() {
  const { snapshot } = useSession();
  if (!snapshot) return null;

  const listings = snapshot.posts.filter((post) => post.type === 'listing');

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Ilan vitrini</div>
          <h1>Profesyonel ilan akışı</h1>
          <p className="muted">Marka, model, fiyat, satıcı tipi ve hızlı filtrelerle listing odağını büyüt.</p>
        </div>
        <Link className="button button-primary" href="/feed">
          Yeni ilan oluştur
        </Link>
      </section>

      {listings.length ? (
        <div className="stack">
          {listings.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <section className="empty-state soft-card">
          <strong>Yayında ilan bulunmuyor.</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            İlk profesyonel listing kartını feed ekranındaki yayın panelinden oluşturabilirsiniz.
          </p>
        </section>
      )}
    </>
  );
}
