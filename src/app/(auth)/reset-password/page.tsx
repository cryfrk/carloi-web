'use client';

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, resetPasswordWithToken } = useSession();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState((searchParams.get('code') || '').replace(/\D/g, '').slice(0, 6));
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token') || '';

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      if (token) {
        await resetPasswordWithToken(token, password);
      } else {
        await resetPassword(email.trim(), code.trim(), password);
      }
      router.push('/feed');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sifre guncellenemedi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Yeni sifre belirle"
      subtitle={
        token
          ? 'Maildeki guvenli baglanti ile geldiniz. Yeni sifrenizi belirlediginizde hesabiniz acilir.'
          : 'Eski kod akisini kullaniyorsaniz e-posta, kod ve yeni sifrenizi girin.'
      }
      alternateHref="/login"
      alternateLabel="Giris ekranina don"
    >
      <div className="stack">
        {!token ? (
          <>
            <label className="stack">
              <span className="field-label">E-posta adresi</span>
              <input
                className="input"
                placeholder="eposta@ornek.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="stack">
              <span className="field-label">Kod</span>
              <input
                className="input"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </label>
          </>
        ) : null}
        <label className="stack">
          <span className="field-label">Yeni sifre</span>
          <input
            className="input"
            type="password"
            placeholder="En az 8 karakter"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <div className="status-banner error">{error}</div> : null}
        <button className="button button-primary" disabled={loading} onClick={handleSubmit} type="button">
          {loading ? 'Sifre guncelleniyor...' : 'Sifreyi guncelle'}
        </button>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Sifre ekrani hazirlaniyor"
          subtitle="Guvenli sifre sifirlama akisi yukleniyor."
        >
          <div className="stack" />
        </AuthShell>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
}
