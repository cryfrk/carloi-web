import Link from 'next/link';

import { AdminPageTemplate } from '@/components/admin/admin-page';

export default function AdminCommercialPage() {
  return (
    <AdminPageTemplate
      eyebrow="Commercial"
      title="Commercial review queue"
      description="Ticari hesap basvurulari, tek seferlik belge setleri, suspicious document sinyalleri ve manual review aksiyonlari bu yuzeyde yonetilecek."
      panels={[
        {
          title: 'Queue lanes',
          description:
            'draft, pending_review, approved, rejected, suspended ve revoked durumlari filtrelenebilir tablo kartlari olarak gosterilecek.',
          bullets: [
            'Pending review',
            'Additional verification required',
            'Rejected and resubmission',
            'Suspended / revoked',
          ],
        },
        {
          title: 'Review row structure',
          description:
            'Her satirda companyName, VKN/TCKN, document count, suspicious flags, user handle, updatedAt ve review shortcut aksiyonlari yer alacak.',
          bullets: [
            'Company name and account handle',
            'Document count and suspicious flag badges',
            'Reviewer state and updated time',
          ],
        },
        {
          title: 'Mandatory actions',
          description:
            'Approve, reject, suspend ve revoke aksiyonlari reason text ve audit log zorunlulugu ile calisacak.',
          bullets: [
            'Approve unlocks commercial privileges',
            'Reject requires reason and allows resubmission',
            'Suspend requires reason and disables privileges',
            'Revoke requires reason and closes current approval',
          ],
        },
      ]}
    >
      <section className="support-grid">
        <div className="support-card">
          <div className="eyebrow">Sample row</div>
          <strong style={{ display: 'block', marginTop: 8 }}>Carloi Motors A.S.</strong>
          <p className="muted">Pending review · 4 belge · 1 suspicious flag</p>
          <Link className="button button-secondary" href="/admin/commercial/sample-review">
            Detail wireframe
          </Link>
        </div>
      </section>
    </AdminPageTemplate>
  );
}
