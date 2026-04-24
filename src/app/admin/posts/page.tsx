import { AdminPageTemplate } from '@/components/admin/admin-page';

export default function AdminPostsPage() {
  return (
    <AdminPageTemplate
      eyebrow="Posts"
      title="Social content moderation"
      description="Kullanıcı postları, raporlar, moderasyon kararları ve kaldırma geçmişi için ayrılmış operasyon yüzeyi."
      panels={[
        {
          title: 'Reported content table',
          description: 'İçerik raporları, tekrar eden ihlal örüntüleri ve admin aksiyon logları.',
        },
      ]}
    />
  );
}
