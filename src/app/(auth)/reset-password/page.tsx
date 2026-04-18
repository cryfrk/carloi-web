'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get('email') || '');
  }, []);

  return (
    <AuthShell
      title="Şifreni yenile"
      subtitle="Mailine gelen kodu ve yeni şifreni gir. Başarılı olursa doğrudan hesabına geçiş yaparsın."
      alternateHref="/login"
      alternateLabel="Giriş ekranına dön"
    >
      <div className="stack">
        <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Kod" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="input" placeholder="Yeni şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button
          className="button button-primary"
          onClick={async () => {
            setError('');
            try {
              await resetPassword(email, code, password);
              router.push('/feed');
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Şifre güncellenemedi.');
            }
          }}
        >
          Şifreyi güncelle
        </button>
      </div>
    </AuthShell>
  );
}
