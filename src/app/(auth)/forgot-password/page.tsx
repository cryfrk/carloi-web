'use client';

import Link from 'next/link';
import { useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useSession();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell
      title="Sifre yenileme baglantisi iste"
      subtitle="Hesap e-postani gir. Uygun bir hesap varsa Carloi sana guvenli sifre yenileme baglantisi yollar."
      alternateHref="/login"
      alternateLabel="Giris ekranina don"
    >
      <div className="stack">
        <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        {message ? <div style={{ color: 'var(--brand-strong)' }}>{message}</div> : null}
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button
          className="button button-primary"
          disabled={loading}
          onClick={async () => {
            setError('');
            setLoading(true);
            try {
              const result = await forgotPassword(email);
              setMessage(result.message || 'Baglanti gonderildi.');
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Baglanti gonderilemedi.');
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? 'Baglanti hazirlaniyor...' : 'Sifre yenileme baglantisi gonder'}
        </button>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="muted">
          Maildeki baglantiyi acamadin mi? Sifre yenile ekranini ac.
        </Link>
      </div>
    </AuthShell>
  );
}
