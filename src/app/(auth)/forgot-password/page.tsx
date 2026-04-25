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

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await forgotPassword(email.trim());
      if (result.emailDisabled || result.emailNotConfigured) {
        setMessage('E-posta servisi henüz aktif değil. Lütfen daha sonra tekrar deneyin.');
        return;
      }

      setMessage(
        result.message ||
          'Bu adresle kayitli bir hesap varsa sifre yenileme baglantisi e-posta kutunuza gonderildi.',
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sifre yenileme baglantisi gonderilemedi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sifreni yenile"
      subtitle="Hesabinda e-posta tanimliysa Carloi sana guvenli sifre yenileme baglantisi gonderir."
      alternateHref="/login"
      alternateLabel="Giris ekranina don"
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
        {message ? <div className="status-banner success">{message}</div> : null}
        {error ? <div className="status-banner error">{error}</div> : null}
        <button className="button button-primary" disabled={loading} onClick={handleSubmit} type="button">
          {loading ? 'Baglanti hazirlaniyor...' : 'Sifre yenileme baglantisi gonder'}
        </button>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="muted">
          Linke ulasamiyorsan sifre yenile ekranini manuel ac
        </Link>
      </div>
    </AuthShell>
  );
}
