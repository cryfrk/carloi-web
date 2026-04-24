import type { Metadata } from 'next';

import { PaymentPageClient } from '@/components/payment/payment-page-client';

export const metadata: Metadata = {
  title: 'Sigorta Odeme Adimi',
  description:
    'Carloi sigorta odeme adimi bankanin guvenli altyapisinda tamamlanir. Odeme onayi sonrasinda uygulamaya geri donersiniz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentPage() {
  return <PaymentPageClient />;
}
