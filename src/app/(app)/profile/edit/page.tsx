'use client';

import { useState } from 'react';

import { useSession } from '@/providers/session-provider';

export default function EditProfilePage() {
  const { snapshot, runSnapshotAction, uploadMedia } = useSession();
  const [name, setName] = useState(snapshot?.profile.name || '');
  const [handle, setHandle] = useState(snapshot?.profile.handle || '');
  const [bio, setBio] = useState(snapshot?.profile.bio || '');
  const [email, setEmail] = useState(snapshot?.settings.email || '');
  const [phone, setPhone] = useState(snapshot?.settings.phone || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  if (!snapshot) return null;

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Profil Düzenleme</div>
          <h1 style={{ margin: '8px 0 6px' }}>Web ve mobil için ortak profilini güncelle</h1>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 16 }}>
        <div className="two-up">
          <input className="input" placeholder="Ad soyad" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="@kullaniciadi" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <textarea className="textarea" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <div className="two-up">
          <label className="soft-card" style={{ padding: 18 }}>
            <strong>Profil fotoğrafı</strong>
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
          </label>
          <label className="soft-card" style={{ padding: 18 }}>
            <strong>Kapak görseli</strong>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <button
          className="button button-primary"
          onClick={async () => {
            let avatarUri = snapshot.profile.avatarUri;
            let coverUri = snapshot.profile.coverUri;

            if (avatarFile) avatarUri = await uploadMedia(avatarFile, 'image');
            if (coverFile) coverUri = await uploadMedia(coverFile, 'image');

            await runSnapshotAction('/api/onboarding', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profile: {
                  name,
                  handle,
                  bio,
                  avatarUri,
                  coverUri,
                },
                settings: {
                  email,
                  phone,
                },
                vehicle: snapshot.vehicle,
                profileSegment: snapshot.profileSegment,
              }),
            });
          }}
        >
          Değişiklikleri kaydet
        </button>
      </section>
    </>
  );
}
