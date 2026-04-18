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

  return (
    <AuthShell
      title="Şifre sıfırlama kodu iste"
      subtitle="Hesap e-postanı gir. Uygun bir hesap varsa Carloi sana sıfırlama kodu yollar."
      alternateHref="/login"
      alternateLabel="Giriş ekranına dön"
    >
      <div className="stack">
        <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        {message ? <div style={{ color: 'var(--brand-strong)' }}>{message}</div> : null}
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button
          className="button button-primary"
          onClick={async () => {
            setError('');
            try {
              const result = await forgotPassword(email);
              setMessage(result.message || 'Kod gönderildi.');
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Kod gönderilemedi.');
            }
          }}
        >
          Şifre sıfırlama kodu gönder
        </button>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="muted">
          Zaten kodun var mı? Şifreyi yenile.
        </Link>
      </div>
    </AuthShell>
  );
}
