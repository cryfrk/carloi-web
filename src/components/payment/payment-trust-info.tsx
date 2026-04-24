import styles from '@/components/payment/payment-page.module.css';

interface PaymentTrustInfoProps {
  trustMessage?: string;
}

export function PaymentTrustInfo({ trustMessage }: PaymentTrustInfoProps) {
  return (
    <section className={styles.card}>
      <p className={styles.cardEyebrow}>Trust information</p>
      <h2 className={styles.cardTitle}>Bu odeme neden web sayfasinda aliniyor?</h2>
      <ul className={styles.trustList}>
        <li className={styles.trustListItem}>
          <span className={styles.trustIndex}>01</span>
          <span className={styles.trustText}>
            Odeme, guvenli banka altyapisi uzerinden tamamlanir. Carloi bu adimi mobil uygulamadan ayri ama size
            tanidik bir yuzeyle sunar.
          </span>
        </li>
        <li className={styles.trustListItem}>
          <span className={styles.trustIndex}>02</span>
          <span className={styles.trustText}>
            Kart detaylari uygulama icinde tutulmaz. Boylece sigorta gibi gercek dunya odemelerinde ek guvenlik
            katmani korunur.
          </span>
        </li>
        <li className={styles.trustListItem}>
          <span className={styles.trustIndex}>03</span>
          <span className={styles.trustText}>
            Odeme tamamlandiginda yeniden Carloi&apos;ye donersiniz. Sonraki adimlar mesaj akisi ve e-posta uzerinden
            sizinle paylasilir.
          </span>
        </li>
      </ul>
      <div className={styles.infoStrip}>
        {trustMessage || 'Resmi banka odeme sureci izlenmelidir. Platform resmi odeme saglayicisi degildir.'}
      </div>
    </section>
  );
}
