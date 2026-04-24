'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword, resetPasswordWithToken } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || '');
    setCode((params.get('code') || '').replace(/\D/g, '').slice(0, 6));
    setToken(params.get('token') || '');
  }, []);

  return (
    <AuthShell
      title="Sifreni yenile"
      subtitle={
        token
          ? 'Mailindeki guvenli baglanti ile geldin. Yeni sifreni belirlediginde hesabina dogrudan gecis yaparsin.'
          : 'Eski bir kod akisi kullaniyorsan mailine gelen kodu ve yeni sifreni gir.'
      }
      alternateHref="/login"
      alternateLabel="Giris ekranina don"
    >
      <div className="stack">
        {!token ? (
          <>
            <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" placeholder="Kod" value={code} onChange={(e) => setCode(e.target.value)} />
          </>
        ) : null}
        <input
          className="input"
          placeholder="Yeni sifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button
          className="button button-primary"
          disabled={loading}
          onClick={async () => {
            setError('');
            setLoading(true);
            try {
              if (token) {
                await resetPasswordWithToken(token, password);
              } else {
                await resetPassword(email, code, password);
              }
              router.push('/feed');
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Sifre guncellenemedi.');
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? 'Sifre guncelleniyor...' : 'Sifreyi guncelle'}
        </button>
      </div>
    </AuthShell>
  );
}
