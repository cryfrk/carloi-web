import styles from '@/components/payment/payment-page.module.css';

interface PaymentResultCardProps {
  state: 'success' | 'failed' | 'cancelled';
}

const RESULT_COPY = {
  success: {
    toneClass: styles.resultSuccess,
    toneLabel: 'Success',
    title: 'Odemeniz alindi.',
    body:
      'Sigorta isleminiz baslatildi. Police ve fatura hazirlandiginda size e-posta ve Carloi mesaji ile iletilecektir.',
  },
  failed: {
    toneClass: styles.resultFailed,
    toneLabel: 'Failed',
    title: 'Odeme tamamlanamadi.',
    body:
      'Banka tarafinda onay tamamlanmadi. Kartinizdan kesin tahsilat alinip alinmadigini bankanizdan kontrol ederek Carloi uygulamasindan islemi yeniden baslatabilirsiniz.',
  },
  cancelled: {
    toneClass: styles.resultCancelled,
    toneLabel: 'Cancelled',
    title: 'Odeme adimi iptal edildi.',
    body:
      'Islem sonlandirildi. Dilerseniz Carloi uygulamasina donup ayni sohbet uzerinden odeme surecini daha sonra yeniden baslatabilirsiniz.',
  },
} as const;

export function PaymentResultCard({ state }: PaymentResultCardProps) {
  const copy = RESULT_COPY[state];

  return (
    <section className={`${styles.card} ${styles.resultCard}`}>
      <span className={`${styles.resultTone} ${copy.toneClass}`}>{copy.toneLabel}</span>
      <div>
        <p className={styles.cardEyebrow}>Payment result</p>
        <h2 className={styles.cardTitle}>{copy.title}</h2>
      </div>
      <p className={styles.resultBody}>{copy.body}</p>
    </section>
  );
}
