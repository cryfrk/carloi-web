import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/post-card';
import { getPublicPost } from '@/lib/backend';
import { webEnv } from '@/lib/env';

export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }): Promise<Metadata> {
  try {
    const { postId } = await params;
    const post = await getPublicPost(postId);
    if (!post) {
      return {};
    }

    return {
      title: `${post.authorName} · Gönderi`,
      description: post.content || post.listing?.summaryLine || 'Carloi paylaşımı',
      openGraph: {
        title: `${post.authorName} · Carloi`,
        description: post.content || post.listing?.summaryLine || 'Carloi paylaşımı',
        images: [post.media.find((item) => item.uri)?.uri || `${webEnv.shareBaseUrl}/carloi.png`],
      },
    };
  } catch {
    return {};
  }
}

export default async function PublicPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = await getPublicPost(postId);

  if (!post) {
    notFound();
  }

  return (
    <main className="page-shell public-layout">
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Carloi Gönderisi</div>
          <h1 style={{ margin: '8px 0 6px' }}>{post.authorName}</h1>
          <p className="muted" style={{ margin: 0 }}>
            Carloi web’de paylaşılan gönderiyi inceliyorsun.
          </p>
        </div>
        <Link className="button button-primary" href="/register">
          Carloi’ye katıl
        </Link>
      </section>
      <PostCard post={post} />
    </main>
  );
}
