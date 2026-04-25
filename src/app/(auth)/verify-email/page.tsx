'use client';

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resendVerificationCode, verifyEmail, verifyEmailToken } = useSession();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [intent, setIntent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextEmail = searchParams.get('email') || '';
    const nextToken = searchParams.get('token') || '';
    const nextCode = searchParams.get('code') || '';
    const nextIntent = searchParams.get('intent') || '';
    const initialMessage = searchParams.get('message') || '';

    setEmail(nextEmail);
    setToken(nextToken);
    setCode(nextCode);
    setIntent(nextIntent);
    setMessage(initialMessage);
  }, [searchParams]);

  useEffect(() => {
    if (!token && !(email && code)) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setMessage('Dogrulama baglantisi isleniyor...');

    const task = token ? verifyEmailToken(token) : verifyEmail(email, code);

    void task
      .then(() => {
        if (!cancelled) {
          router.push(intent === 'commercial' ? '/settings/commercial' : '/feed');
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Dogrulama baglantisi kullanilamadi.');
          setMessage('');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, email, intent, router, token, verifyEmail, verifyEmailToken]);

  async function handleResend() {
    if (!email.trim()) {
      setError('Lutfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await resendVerificationCode(email.trim());
      if (result.emailDisabled || result.emailNotConfigured) {
        setMessage('E-posta servisi henuz aktif degil. Lutfen daha sonra tekrar deneyin.');
        return;
      }

      setMessage(result.message || 'Dogrulama baglantisi yeniden gonderildi.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Dogrulama baglantisi yeniden gonderilemedi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="E-posta adresini dogrula"
      subtitle="Carloi hesabini aktif etmek icin mailindeki baglantiyi ac. Baglanti kullanildiginda hesap oturumun otomatik acilabilir."
      alternateHref="/login"
      alternateLabel="Daha sonra giris ekranina don"
    >
      <div className="stack">
        <label className="stack">
          <span className="field-label">E-posta adresi</span>
          <input
            className="input"
            placeholder="eposta@ornek.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <div className="support-card">
          <strong>Dogrulama nasil ilerler?</strong>
          <ul className="admin-bullet-list">
            <li>Maildeki "Hesabimi dogrula" butonu her zaman www.carloi.com alanina acilir.</li>
            <li>Baglanti kullanilir kullanilmaz API tarafinda token dogrulanir.</li>
            <li>Ticari kayit yaptiysan dogrulama sonrasi ticari onboarding ekranina yonlenirsin.</li>
          </ul>
        </div>
        {message ? <div className="status-banner success">{message}</div> : null}
        {error ? <div className="status-banner error">{error}</div> : null}
        <button className="button button-secondary" disabled={loading} onClick={handleResend} type="button">
          {loading ? 'Kontrol ediliyor...' : 'Dogrulama baglantisini yeniden gonder'}
        </button>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Dogrulama hazirlaniyor" subtitle="Baglanti kontrolu yapiliyor.">
          <div className="stack" />
        </AuthShell>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
