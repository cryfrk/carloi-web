'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState('/feed');

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('next');
    if (value) {
      setNextPath(value);
    }
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await login(identifier, password);
      router.push(nextPath);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Hesabına giriş yap"
      subtitle="Aynı Carloi hesabı ile feed, mesajlar, ilanlar ve Loi AI web deneyimine geç."
      alternateHref="/register"
      alternateLabel="Hesabın yok mu? Ücretsiz kayıt ol."
    >
      <div className="stack">
        <input className="input" placeholder="E-posta veya telefon" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <input className="input" placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button className="button button-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
        </button>
        <Link href="/forgot-password" className="muted">
          Şifremi unuttum
        </Link>
      </div>
    </AuthShell>
  );
}
