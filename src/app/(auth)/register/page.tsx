'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { useSession } from '@/providers/session-provider';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useSession();
  const [form, setForm] = useState({
    name: '',
    handle: '',
    bio: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const result = await register(form);
      router.push(`/verify-email?email=${encodeURIComponent(result.email || form.email)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kayıt olunamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Carloi hesabı oluştur"
      subtitle="Tek hesapla mobil ve web sürümünde aynı sosyal akışa, ilanlara ve araç araçlığına eriş."
      alternateHref="/login"
      alternateLabel="Zaten hesabın var mı? Giriş yap."
    >
      <div className="stack">
        <input className="input" placeholder="Ad soyad" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
        <input className="input" placeholder="@kullaniciadi" value={form.handle} onChange={(e) => setForm((c) => ({ ...c, handle: e.target.value }))} />
        <textarea className="textarea" placeholder="Kısa profil açıklaması" value={form.bio} onChange={(e) => setForm((c) => ({ ...c, bio: e.target.value }))} />
        <input className="input" placeholder="E-posta" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} />
        <input className="input" placeholder="Şifre" type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} />
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button className="button button-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Hesap oluşturuluyor...' : 'Hesap oluştur'}
        </button>
      </div>
    </AuthShell>
  );
}
