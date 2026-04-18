'use client';

import { useMemo, useState } from 'react';

import type { BackendResponse, Post } from '@/lib/types';
import { useSession } from '@/providers/session-provider';

const emptyListingDraft = {
  title: '',
  price: '',
  city: '',
  district: '',
  location: '',
  transmission: '',
  fuelType: '',
  bodyType: '',
  color: '',
  plateOrigin: '',
  damageRecord: '',
  paintInfo: '',
  changedParts: '',
  accidentInfo: '',
  description: '',
  extraEquipment: '',
  includeExpertiz: true,
  phone: '',
};

export function ComposerCard() {
  const { snapshot, runSnapshotAction, uploadMedia } = useSession();
  const [mode, setMode] = useState<'standard' | 'listing'>('standard');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [listingDraft, setListingDraft] = useState(emptyListingDraft);
  const [submitting, setSubmitting] = useState(false);

  const canCreateListing = Boolean(snapshot?.vehicle);

  const selectedKinds = useMemo(
    () =>
      files.map((file) =>
        file.type.startsWith('video/')
          ? 'video'
          : file.type === 'image/gif'
            ? 'gif'
            : 'image',
      ),
    [files],
  );

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const uploadedMedia = await Promise.all(
        files.map(async (file) => {
          const kind = file.type.startsWith('video/')
            ? 'video'
            : file.type === 'image/gif'
              ? 'gif'
              : 'image';

          const url = await uploadMedia(file, kind);
          return {
            kind,
            uri: url,
            label: file.name,
            hint: mode === 'listing' ? 'İlan medyası' : 'Gönderi medyası',
            fileName: file.name,
            mimeType: file.type,
          };
        }),
      );

      await runSnapshotAction('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          postType: mode,
          selectedMediaKinds: selectedKinds,
          selectedMedia: uploadedMedia,
          listingDraft: mode === 'listing' ? listingDraft : undefined,
        }),
      });

      setContent('');
      setFiles([]);
      setListingDraft(emptyListingDraft);
      setMode('standard');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <div className="eyebrow">Yeni paylaşım</div>
          <h2 style={{ margin: '8px 0 0' }}>Carloi akışına içerik ekle</h2>
        </div>
        <div className="post-actions">
          <button className={`button ${mode === 'standard' ? 'button-primary' : 'button-secondary'}`} onClick={() => setMode('standard')}>
            Gönderi
          </button>
          <button
            className={`button ${mode === 'listing' ? 'button-primary' : 'button-secondary'}`}
            disabled={!canCreateListing}
            onClick={() => setMode('listing')}
          >
            İlan
          </button>
        </div>
      </div>

      <textarea
        className="textarea"
        placeholder={mode === 'listing' ? 'İlanın hikayesini ve öne çıkan detayları yazın.' : 'Toplulukla ne paylaşmak istiyorsunuz?'}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />

      <label className="soft-card" style={{ padding: 16, display: 'grid', gap: 10, cursor: 'pointer' }}>
        <strong>Fotoğraf / video ekle</strong>
        <span className="muted">Web sürümünde yüksek çözünürlüklü galeriyle yayınlanır.</span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(event) => setFiles(Array.from(event.target.files || []))}
        />
        {files.length ? (
          <div className="post-actions">
            {files.map((file) => (
              <span key={file.name} className="tag">
                {file.name}
              </span>
            ))}
          </div>
        ) : null}
      </label>

      {mode === 'listing' ? (
        <div className="two-up">
          {[
            ['title', 'İlan başlığı'],
            ['price', 'Fiyat'],
            ['city', 'Şehir'],
            ['district', 'İlçe'],
            ['location', 'Konum satırı'],
            ['transmission', 'Vites'],
            ['fuelType', 'Yakıt'],
            ['bodyType', 'Kasa tipi'],
            ['color', 'Renk'],
            ['plateOrigin', 'Plaka / il'],
            ['damageRecord', 'Hasar kaydı'],
            ['paintInfo', 'Boya'],
            ['changedParts', 'Değişen'],
            ['accidentInfo', 'Kaza geçmişi'],
            ['phone', 'Telefon'],
            ['extraEquipment', 'Ek donanım'],
          ].map(([key, label]) => (
            <input
              key={key}
              className="input"
              placeholder={label}
              value={(listingDraft as Record<string, string | boolean>)[key] as string}
              onChange={(event) =>
                setListingDraft((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
            />
          ))}

          <textarea
            className="textarea"
            style={{ gridColumn: '1 / -1' }}
            placeholder="İlan açıklaması"
            value={listingDraft.description}
            onChange={(event) => setListingDraft((current) => ({ ...current, description: event.target.value }))}
          />

          <label className="tag" style={{ justifyContent: 'space-between' }}>
            <span>VCARX ekspertiz görselini ekle</span>
            <input
              type="checkbox"
              checked={listingDraft.includeExpertiz}
              onChange={(event) =>
                setListingDraft((current) => ({
                  ...current,
                  includeExpertiz: event.target.checked,
                }))
              }
            />
          </label>
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span className="muted">
          {mode === 'listing'
            ? canCreateListing
              ? 'Araç profilinizden gelen bilgiler ilan şablonuna otomatik eklenir.'
              : 'İlan oluşturmak için önce araç profilinizi ekleyin.'
            : 'Web akışında geniş medya alanıyla yayınlanır.'}
        </span>
        <button className="button button-primary" disabled={submitting || (mode === 'listing' && !canCreateListing)} onClick={handleSubmit}>
          {submitting ? 'Paylaşılıyor...' : mode === 'listing' ? 'İlanı yayınla' : 'Gönderiyi yayınla'}
        </button>
      </div>
    </section>
  );
}
