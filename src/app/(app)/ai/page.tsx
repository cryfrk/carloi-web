'use client';

import { useState } from 'react';

import { PostCard } from '@/components/post-card';
import { useSession } from '@/providers/session-provider';

const suggestionChips = [
  'Bugün hangi arabayı alıyoruz?',
  '1.2 milyon bütçeye en mantıklı otomatik sedanları sırala.',
  'Kendi aracımın piyasa değerini çıkar.',
  'Bu ilan için güçlü bir açıklama yaz.',
];

export default function AiPage() {
  const { snapshot, runSnapshotAction } = useSession();
  const [message, setMessage] = useState('');
  if (!snapshot) return null;

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Loi AI</div>
          <h1 style={{ margin: '8px 0 6px' }}>Araç uzmanı, pazar rehberi, ilan danışmanı</h1>
          <p className="muted" style={{ margin: 0 }}>
            Loi AI aynı uygulama verisini kullanır; ilanları karşılaştırır, piyasa değeri çıkarır ve kullanıcıyı yönlendirir.
          </p>
        </div>
        <button className="button button-secondary" onClick={() => runSnapshotAction('/api/ai/clear', { method: 'POST' })}>
          Mesajları temizle
        </button>
      </section>

      {!snapshot.aiMessages.length ? (
        <section className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
          <div className="eyebrow">Öneriler</div>
          <h2>Bugün hangi arabayı alıyoruz?</h2>
          <div className="post-actions" style={{ justifyContent: 'center', marginTop: 18 }}>
            {suggestionChips.map((chip) => (
              <button key={chip} className="button button-secondary" onClick={() => setMessage(chip)}>
                {chip}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="glass-card" style={{ padding: 20, display: 'grid', gap: 16 }}>
        {snapshot.aiMessages.map((item) => (
          <div key={item.id} className={`message-bubble ${item.role === 'user' ? 'mine' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <strong>{item.role === 'user' ? 'Sen' : 'Loi AI'}</strong>
              <div className="post-actions">
                {item.canEdit ? (
                  <button
                    className="button button-ghost"
                    onClick={async () => {
                      const nextContent = window.prompt('Mesajı düzenle', item.content);
                      if (!nextContent) return;
                      await runSnapshotAction(`/api/ai/messages/${item.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: nextContent }),
                      });
                    }}
                  >
                    Düzenle
                  </button>
                ) : null}
                <button className="button button-ghost" onClick={() => runSnapshotAction(`/api/ai/messages/${item.id}`, { method: 'DELETE' })}>
                  Sil
                </button>
              </div>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>{item.content}</div>
            {item.relatedPostIds?.length ? (
              <div className="stack" style={{ marginTop: 18 }}>
                {item.relatedPostIds
                  .map((id) => snapshot.posts.find((post) => post.id === id))
                  .filter(Boolean)
                  .map((post) => (
                    <PostCard key={post!.id} post={post!} compact />
                  ))}
              </div>
            ) : null}
          </div>
        ))}
      </section>

      <section className="glass-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
        <textarea className="textarea" placeholder="Loi AI’ye araç, ilan veya piyasa sorusu yaz" value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="post-actions">
          {suggestionChips.map((chip) => (
            <button key={chip} className="button button-ghost" onClick={() => setMessage(chip)}>
              {chip}
            </button>
          ))}
        </div>
        <button
          className="button button-primary"
          onClick={async () => {
            if (!message.trim()) return;
            await runSnapshotAction('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message }),
            });
            setMessage('');
          }}
        >
          Loi AI’ye gönder
        </button>
      </section>
    </>
  );
}
