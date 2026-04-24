'use client';

import { use, useEffect, useMemo, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface CommercialDocumentItem {
  id: string;
  type: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
  rejectReason?: string | null;
  suspiciousFlag?: boolean;
  fileUrl?: string;
}

interface CommercialNoteItem {
  id: string;
  note: string;
  noteType?: string;
  createdAt: string;
  actorId?: string | null;
}

interface CommercialHistoryItem {
  id: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface CommercialReviewDetail {
  profile: {
    id: string;
    status: string;
    companyName: string;
    taxOrIdentityType: string;
    taxOrIdentityNumber: string;
    tradeName?: string | null;
    mersisNumber?: string | null;
    authorizedPersonName?: string | null;
    authorizedPersonTitle?: string | null;
    phone?: string | null;
    city?: string | null;
    district?: string | null;
    address?: string | null;
    notes?: string | null;
    submittedAt?: string | null;
    updatedAt?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    handle: string;
    accountType: string;
    commercialStatus: string;
    riskLevel: string;
    commercialRejectedReason?: string | null;
    commercialApprovedAt?: string | null;
    canCreatePaidListings: boolean;
  };
  documents: CommercialDocumentItem[];
  adminNotes: CommercialNoteItem[];
  history: CommercialHistoryItem[];
}

export default function AdminCommercialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = use(params);
  const [review, setReview] = useState<CommercialReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const loadReview = async () => {
    setLoading(true);
    try {
      const response = await requestAdminProxy<{ success: true; review: CommercialReviewDetail }>(
        `/commercial/${profileId}`,
      );
      setReview(response.review);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ticari basvuru detaylari yuklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReview();
  }, [profileId]);

  const metrics = useMemo(() => {
    const documents = review?.documents || [];
    return [
      {
        label: 'Durum',
        value: loading ? '...' : review?.profile.status || '-',
        helper: 'Ticari profil durumunun guncel gorunumu.',
      },
      {
        label: 'Belge sayisi',
        value: loading ? '...' : String(documents.length),
        helper: 'Profil icin yuklenmis toplam belge.',
      },
      {
        label: 'Suspicious belge',
        value: loading ? '...' : String(documents.filter((item) => item.suspiciousFlag).length),
        helper: 'Ek inceleme gerektirebilecek belge sinyalleri.',
      },
      {
        label: 'Admin note',
        value: loading ? '...' : String(review?.adminNotes.length || 0),
        helper: 'Bu basvuru icin kayitli operasyon notlari.',
      },
    ];
  }, [loading, review]);

  const submitDecision = async (action: 'approve' | 'reject' | 'suspend' | 'revoke') => {
    const needsReason = action !== 'approve';
    const reason =
      needsReason
        ? window.prompt(
            action === 'reject'
              ? 'Reddetme nedeni'
              : action === 'suspend'
                ? 'Askıya alma nedeni'
                : 'Yetkiyi kaldirma nedeni',
            '',
          ) || ''
        : '';

    if (needsReason && !reason.trim()) {
      window.alert('Bu islem icin gerekce zorunludur.');
      return;
    }

    const confirmed = window.confirm(
      action === 'approve'
        ? 'Bu ticari hesabi onaylamak istediginizden emin misiniz?'
        : `Bu ticari hesabi ${action} olarak isaretlemek istediginizden emin misiniz?`,
    );

    if (!confirmed) {
      return;
    }

    setPendingAction(action);
    try {
      const response = await requestAdminProxy<{ success: true; review: CommercialReviewDetail }>(
        `/commercial/${profileId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        },
      );
      setReview(response.review);
      setError(null);
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Admin islemi tamamlanamadi.');
    } finally {
      setPendingAction(null);
    }
  };

  const submitNote = async () => {
    if (!noteDraft.trim()) {
      window.alert('Admin notu bos olamaz.');
      return;
    }

    setPendingAction('note');
    try {
      const response = await requestAdminProxy<{ success: true; review: CommercialReviewDetail }>(
        `/commercial/${profileId}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: noteDraft.trim(),
            noteType: 'operations',
          }),
        },
      );
      setReview(response.review);
      setNoteDraft('');
      setError(null);
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Admin notu kaydedilemedi.');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <AdminPageTemplate
      eyebrow="Commercial Detail"
      title={loading ? 'Commercial review' : review?.profile.companyName || `Commercial review ${profileId}`}
      description="Ticari profil, belge gecmisi, admin note ve review aksiyonlari tek ekranda yonetilir."
      metrics={metrics}
    >
      <section className="admin-panel-grid">
        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>Business profile</h3>
          {loading ? <p className="muted">Detaylar yukleniyor...</p> : null}
          {error ? <p className="muted">{error}</p> : null}
          {!loading && !error && review ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div><strong>Kullanici:</strong> {review.user.name} ({review.user.handle})</div>
              <div><strong>E-posta:</strong> {review.user.email}</div>
              <div><strong>Durum:</strong> {review.profile.status}</div>
              <div><strong>Risk:</strong> {review.user.riskLevel}</div>
              <div><strong>VKN/TCKN:</strong> {review.profile.taxOrIdentityType} / {review.profile.taxOrIdentityNumber}</div>
              <div><strong>Yetkili:</strong> {review.profile.authorizedPersonName || '-'}</div>
              <div><strong>Sehir / Ilce:</strong> {[review.profile.city, review.profile.district].filter(Boolean).join(' / ') || '-'}</div>
              <div><strong>Adres:</strong> {review.profile.address || '-'}</div>
              <div><strong>Yayin yetkisi:</strong> {review.user.canCreatePaidListings ? 'acik' : 'kapali'}</div>
              <div><strong>Reddetme nedeni:</strong> {review.user.commercialRejectedReason || '-'}</div>
            </div>
          ) : null}
        </article>

        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>Review actions</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Reject, suspend ve revoke islemlerinde gerekce zorunludur ve audit log yazilir.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="button-primary" disabled={pendingAction !== null} onClick={() => void submitDecision('approve')}>
              {pendingAction === 'approve' ? 'Isleniyor...' : 'Approve'}
            </button>
            <button className="button-secondary" disabled={pendingAction !== null} onClick={() => void submitDecision('reject')}>
              {pendingAction === 'reject' ? 'Isleniyor...' : 'Reject'}
            </button>
            <button className="button-secondary" disabled={pendingAction !== null} onClick={() => void submitDecision('suspend')}>
              {pendingAction === 'suspend' ? 'Isleniyor...' : 'Suspend'}
            </button>
            <button className="button-secondary" disabled={pendingAction !== null} onClick={() => void submitDecision('revoke')}>
              {pendingAction === 'revoke' ? 'Isleniyor...' : 'Revoke'}
            </button>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            <textarea
              className="input"
              rows={4}
              placeholder="Operasyon notu ekle"
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
            />
            <button className="button-secondary" disabled={pendingAction !== null} onClick={() => void submitNote()}>
              {pendingAction === 'note' ? 'Kaydediliyor...' : 'Not Ekle'}
            </button>
          </div>
        </article>
      </section>

      <section className="admin-panel-grid">
        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>Documents</h3>
          {loading ? <p className="muted">Belgeler yukleniyor...</p> : null}
          {!loading && !error && review && review.documents.length === 0 ? (
            <p className="muted">Bu basvuru icin belge bulunamadi.</p>
          ) : null}
          {!loading && !error && review?.documents.length ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {review.documents.map((document) => (
                <div key={document.id} style={{ border: '1px solid rgba(15,23,42,.08)', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <strong>{document.originalFileName || document.type}</strong>
                    <span className="muted">{document.status}</span>
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {document.type} · {document.mimeType} · {Math.round((document.fileSize || 0) / 1024)} KB
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Yuklendi: {new Date(document.uploadedAt).toLocaleString('tr-TR')}
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Suspicious: {document.suspiciousFlag ? 'evet' : 'hayir'}
                  </div>
                  {document.rejectReason ? (
                    <div className="muted" style={{ marginTop: 6 }}>
                      Red nedeni: {document.rejectReason}
                    </div>
                  ) : null}
                  {document.fileUrl ? (
                    <a href={document.fileUrl} target="_blank" rel="noreferrer" style={{ marginTop: 10, display: 'inline-block' }}>
                      Belgeyi Ac
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>Notes and history</h3>
          {loading ? <p className="muted">Gecmis yukleniyor...</p> : null}
          {!loading && !error && review ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <strong>Admin notes</strong>
                {review.adminNotes.length === 0 ? <p className="muted">Henuz note yok.</p> : null}
                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                  {review.adminNotes.map((note) => (
                    <div key={note.id} style={{ borderLeft: '3px solid #dc2626', paddingLeft: 12 }}>
                      <div>{note.note}</div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {new Date(note.createdAt).toLocaleString('tr-TR')} · {note.noteType || 'general'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong>Audit history</strong>
                {review.history.length === 0 ? <p className="muted">Henuz gecmis kaydi yok.</p> : null}
                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                  {review.history.map((item) => (
                    <div key={item.id} style={{ borderLeft: '3px solid rgba(15,23,42,.14)', paddingLeft: 12 }}>
                      <div>{item.action}</div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {new Date(item.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </AdminPageTemplate>
  );
}
