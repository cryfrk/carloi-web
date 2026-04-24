import type { ExternalPaymentSession } from '@/lib/types';
import styles from '@/components/payment/payment-page.module.css';

interface PaymentAmountCardProps {
  session?: ExternalPaymentSession | null;
  loading?: boolean;
}

function formatAmount(amount?: string, currency?: string) {
  const rawAmount = String(amount || '').trim();
  const rawCurrency = String(currency || '').trim();
  return rawAmount ? `${rawAmount}${rawCurrency ? ` ${rawCurrency}` : ''}` : '-';
}

export function PaymentAmountCard({ session, loading = false }: PaymentAmountCardProps) {
  const displayAmount = formatAmount(session?.amount, session?.currency);

  return (
    <section className={styles.card}>
      <p className={styles.cardEyebrow}>Amount</p>
      <h2 className={styles.cardTitle}>Odeyeceginiz tutar</h2>

      {loading ? (
        <div className={styles.loadingBlock} aria-hidden="true">
          <div className={styles.loadingLineShort} />
          <div className={styles.loadingLine} />
          <div className={styles.loadingLineShort} />
        </div>
      ) : (
        <div className={styles.amountBlock}>
          <div className={styles.amountRow}>
            <span className={styles.amountLabel}>Sigorta hizmet bedeli</span>
            <span className={styles.amountValue}>{displayAmount}</span>
          </div>
          <div className={`${styles.amountRow} ${styles.amountTotal}`}>
            <span className={styles.amountLabel}>Toplam</span>
            <span className={styles.amountTotalValue}>{displayAmount}</span>
          </div>
          <div className={styles.infoStrip}>
            Kart verileri Carloi tarafinda kaydedilmez. Kart bilgileriniz yalnizca guvenli banka altyapisinda
            islenir.
          </div>
        </div>
      )}
    </section>
  );
}
