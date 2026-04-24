import styles from '@/components/payment/payment-page.module.css';

interface PaymentFooterProps {
  supportEmail: string;
  privacyUrl: string;
  termsUrl: string;
}

export function PaymentFooter({ supportEmail, privacyUrl, termsUrl }: PaymentFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <a className={styles.footerLink} href={`mailto:${supportEmail}`}>
          <span className={styles.supportEmail}>{supportEmail}</span>
        </a>
        <a className={styles.footerLink} href={privacyUrl}>
          Gizlilik
        </a>
        <a className={styles.footerLink} href={termsUrl}>
          Kullanim Kosullari
        </a>
      </div>
      <p className={styles.footerText}>
        Carloi odeme verisini uygulama icinde saklamaz. Odeme tamamlandiktan sonra sigorta sureci mesaj ve e-posta
        uzerinden takip edilir.
      </p>
    </footer>
  );
}
