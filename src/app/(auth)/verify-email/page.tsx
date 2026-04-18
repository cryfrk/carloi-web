'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { resendVerificationCode, verifyEmail } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaultEmail = new URLSearchParams(window.location.search).get('email') || '';
    setEmail(defaultEmail);
  }, []);

  async function handleVerify() {
    setLoading(true);
    setError('');
    try {
      await verifyEmail(email, code);
      router.push('/feed');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kod doğrulanamadı.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      const result = await resendVerificationCode(email);
      setMessage(result.message || 'Doğrulama kodu yeniden gönderildi.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kod yeniden gönderilemedi.');
    }
  }

  return (
    <AuthShell
      title="E-posta adresini doğrula"
      subtitle="Carloi hesabını aktif etmek için 6 haneli kodu gir. Kod 10 dakika geçerli."
      alternateHref="/login"
      alternateLabel="Daha sonra giriş ekranına dön"
    >
      <div className="stack">
        <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="6 haneli kod" value={code} onChange={(e) => setCode(e.target.value)} />
        {message ? <div style={{ color: 'var(--brand-strong)' }}>{message}</div> : null}
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button className="button button-primary" onClick={handleVerify} disabled={loading}>
          {loading ? 'Doğrulanıyor...' : 'Doğrula ve devam et'}
        </button>
        <button className="button button-secondary" onClick={handleResend}>
          Kodu tekrar gönder
        </button>
      </div>
    </AuthShell>
  );
}
