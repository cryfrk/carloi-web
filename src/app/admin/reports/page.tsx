import { AdminPageTemplate } from '@/components/admin/admin-page';

export default function AdminReportsPage() {
  return (
    <AdminPageTemplate
      eyebrow="Reports"
      title="Reports and takedown queue"
      description="Kullanıcı ihbarları, içerik kaldırma talepleri ve operasyon karar geçmişi için rapor odaklı yüzey."
      panels={[
        {
          title: 'Incoming reports',
          description: 'User report ve takedown kayıtlarını tek kuyrukta toplayacak tablo.',
        },
      ]}
    />
  );
}
