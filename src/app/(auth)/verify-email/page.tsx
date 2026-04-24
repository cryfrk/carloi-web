'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { resendVerificationCode, verifyEmailToken } = useSession();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [intent, setIntent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const defaultEmail = params.get('email') || '';
    const defaultToken = params.get('token') || '';
    const defaultIntent = params.get('intent') || '';
    const initialMessage = params.get('message') || '';
    setEmail(defaultEmail);
    setToken(defaultToken);
    setIntent(defaultIntent);
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setMessage('E-posta dogrulaniyor...');

    void verifyEmailToken(token)
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
  }, [intent, router, token, verifyEmailToken]);

  async function handleResend() {
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Lutfen e-posta adresini gir.');
      return;
    }
    try {
      const result = await resendVerificationCode(email);
      setMessage(result.message || 'Dogrulama baglantisi yeniden gonderildi.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Dogrulama baglantisi yeniden gonderilemedi.');
    }
  }

  return (
    <AuthShell
      title="E-posta adresini dogrula"
      subtitle={
        token
          ? 'Dogrulama baglantisi acildi. Hesabin dogrulanirken seni otomatik olarak iceri alacagiz.'
          : 'Carloi hesabini aktif etmek icin mailine gelen dogrulama baglantisini ac. Baglanti gelmediyse buradan tekrar gonderebilirsin.'
      }
      alternateHref="/login"
      alternateLabel="Daha sonra giris ekranina don"
    >
      <div className="stack">
        <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ color: 'var(--muted)' }}>
          Mailine gelen baglantiyi actiginda hesabin otomatik olarak dogrulanir. Baglanti sana ulasmadiysa ayni e-posta adresine yeniden gonderebilirsin.
        </div>
        {message ? <div style={{ color: 'var(--brand-strong)' }}>{message}</div> : null}
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        {intent === 'commercial' ? (
          <div className="muted">
            E-posta dogrulamasindan sonra ticari onboarding ekranina yonlendirileceksin.
          </div>
        ) : null}
        <button className="button button-secondary" onClick={handleResend} disabled={loading}>
          {loading && token ? 'Baglanti dogrulaniyor...' : 'Dogrulama baglantisini tekrar gonder'}
        </button>
      </div>
    </AuthShell>
  );
}
