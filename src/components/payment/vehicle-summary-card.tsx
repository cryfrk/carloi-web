import type { ExternalPaymentSession } from '@/lib/types';
import styles from '@/components/payment/payment-page.module.css';

interface VehicleSummaryCardProps {
  session?: ExternalPaymentSession | null;
  loading?: boolean;
}

function SummaryFallback() {
  return (
    <div className={styles.loadingBlock} aria-hidden="true">
      <div className={styles.loadingLine} />
      <div className={styles.loadingLineShort} />
      <div className={styles.loadingLine} />
      <div className={styles.loadingLineShort} />
    </div>
  );
}

export function VehicleSummaryCard({ session, loading = false }: VehicleSummaryCardProps) {
  const vehicleTitle = session?.vehicleSummary?.title || 'Arac bilgisi yukleniyor';
  const plateNumber = session?.vehicleSummary?.plateNumber || 'Paylasilmadi';
  const modelYearSummary = session?.vehicleSummary?.modelYearSummary || session?.vehicleSummary?.location || 'Belirtilmedi';

  return (
    <section className={styles.card}>
      <p className={styles.cardEyebrow}>Vehicle summary</p>
      <h2 className={styles.cardTitle}>Odeme yapilan arac ve hizmet ozetiniz</h2>

      {loading ? (
        <SummaryFallback />
      ) : (
        <div className={styles.summaryGrid}>
          <article className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Arac</span>
            <span className={`${styles.summaryValue} ${styles.summaryValueStrong}`}>{vehicleTitle}</span>
          </article>
          <article className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Plaka</span>
            <span className={styles.summaryValue}>{plateNumber}</span>
          </article>
          <article className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Model / Yil Ozeti</span>
            <span className={styles.summaryValue}>{modelYearSummary}</span>
          </article>
          <article className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Sigorta Turu</span>
            <span className={styles.summaryValue}>{session?.insuranceType || 'Sigorta hizmeti'}</span>
          </article>
          <article className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Islem Referansi</span>
            <span className={`${styles.summaryValue} ${styles.monoValue}`}>{session?.paymentReference || '-'}</span>
          </article>
          <article className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Konum</span>
            <span className={styles.summaryValue}>{session?.vehicleSummary?.location || 'Belirtilmedi'}</span>
          </article>
        </div>
      )}
    </section>
  );
}
