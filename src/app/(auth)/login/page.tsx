'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await login(identifier, password);
      router.push(searchParams.get('next') || '/feed');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Giris yapilamadi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Carloi hesabina giris yap"
      subtitle="Feed, ilanlar, mesajlar ve ticari ayarlar tek oturumla web ve mobilde ayni backend uzerinden senkron calissin."
      alternateHref="/register"
      alternateLabel="Hesabin yok mu? Kayit ol."
    >
      <div className="stack">
        <label className="stack">
          <span className="field-label">E-posta veya telefon</span>
          <input
            className="input"
            placeholder="eposta@ornek.com veya +90..."
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </label>
        <label className="stack">
          <span className="field-label">Sifre</span>
          <input
            className="input"
            placeholder="Sifreniz"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <div className="status-banner error">{error}</div> : null}
        <button className="button button-primary" disabled={loading} onClick={handleSubmit} type="button">
          {loading ? 'Giris yapiliyor...' : 'Giris yap'}
        </button>
        <div className="post-actions">
          <Link href="/forgot-password" className="muted">
            Sifremi unuttum
          </Link>
          <Link href="/register" className="muted">
            Yeni hesap olustur
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Giris hazirlaniyor" subtitle="Oturum ekrani yukleniyor.">
          <div className="stack" />
        </AuthShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
