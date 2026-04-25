'use client';

import Link from 'next/link';

import { useSession } from '@/providers/session-provider';

export default function NotificationsPage() {
  const { snapshot } = useSession();
  if (!snapshot) return null;

  const recentListings = snapshot.posts.filter((post) => post.type === 'listing').slice(0, 4);
  const unreadConversations = snapshot.conversations.filter((conversation) => conversation.unread > 0);

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Bildirim merkezi</div>
          <h1>Akış, sohbet ve ticari durum özeti</h1>
          <p className="muted">
            Ayrı bir backend bildirim servisi açılana kadar en kritik platform hareketlerini burada toparlıyoruz.
          </p>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="support-grid">
          <div className="support-card">
            <div className="eyebrow">Okunmamış mesajlar</div>
            <strong style={{ display: 'block', marginTop: 8 }}>{unreadConversations.length}</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Mesajlar ekranında bekleyen sohbetleri hemen açabilirsiniz.
            </p>
            <Link className="button button-secondary" href="/messages" style={{ marginTop: 14 }}>
              Mesajlara git
            </Link>
          </div>
          <div className="support-card">
            <div className="eyebrow">Ticari hesap durumu</div>
            <strong style={{ display: 'block', marginTop: 8 }}>{snapshot.commercial.commercialStatus}</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Basvuru, belge ve yayin izin durumu ayarlardan takip edilir.
            </p>
            <Link className="button button-secondary" href="/settings/commercial" style={{ marginTop: 14 }}>
              Ticari alanı aç
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="eyebrow">Yakın listing hareketi</div>
        <div className="stack" style={{ marginTop: 14 }}>
          {recentListings.length ? (
            recentListings.map((post) => (
              <Link key={post.id} href={`/listing/${post.id}`} className="support-card">
                <strong>{post.listing?.title || 'Ilan'}</strong>
                <div className="muted" style={{ marginTop: 6 }}>
                  {post.listing?.price || 'Fiyat belirtilmedi'} · {post.listing?.location || 'Konum belirtilmedi'}
                </div>
              </Link>
            ))
          ) : (
            <div className="soft-card">
              <p className="muted" style={{ margin: 0 }}>
                Henüz yeni listing hareketi görünmüyor.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
