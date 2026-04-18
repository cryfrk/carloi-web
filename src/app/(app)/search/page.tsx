'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { PostCard } from '@/components/post-card';
import { useSession } from '@/providers/session-provider';

export default function SearchPage() {
  const { snapshot } = useSession();
  const [query, setQuery] = useState('');
  if (!snapshot) return null;

  const normalized = query.trim().toLocaleLowerCase('tr');

  const users = useMemo(
    () =>
      snapshot.directoryUsers.filter((user) =>
        [user.name, user.handle, user.note].join(' ').toLocaleLowerCase('tr').includes(normalized),
      ),
    [normalized, snapshot.directoryUsers],
  );

  const posts = useMemo(
    () =>
      snapshot.posts.filter((post) =>
        [post.content, post.authorName, post.handle, post.listing?.title, post.listing?.price]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('tr')
          .includes(normalized),
      ),
    [normalized, snapshot.posts],
  );

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Arama & keşfet</div>
          <h1 style={{ margin: '8px 0 6px' }}>Kullanıcı, gönderi, ilan</h1>
        </div>
        <div style={{ width: 'min(420px, 100%)' }}>
          <input className="input" placeholder="Kullanıcı adı, #etiket, araç veya fiyat ara" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="eyebrow">Kullanıcılar</div>
        <div className="support-grid" style={{ marginTop: 16 }}>
          {users.map((user) => (
            <Link key={user.id} href={`/profile/${user.handle.replace(/^@/, '')}`} className="support-card">
              <strong>{user.name}</strong>
              <div className="muted" style={{ marginTop: 6 }}>
                {user.handle}
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>
                {user.note}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
