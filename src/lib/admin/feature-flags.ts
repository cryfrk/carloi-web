export interface AdminFeatureFlagDefinition {
  key:
    | 'enableCommercialOnboarding'
    | 'enableCommercialApprovalGate'
    | 'enableListingComplianceStep'
    | 'enableSafePaymentGuidance'
    | 'enableRiskDetection'
    | 'enablePaidListings'
    | 'enableSubscriptions'
    | 'enableAdminEvidenceExports';
  phase: 1 | 2 | 3 | 4;
  defaultEnabled: boolean;
  label: string;
  description: string;
}

export const adminFeatureFlags: AdminFeatureFlagDefinition[] = [
  {
    key: 'enableCommercialOnboarding',
    phase: 1,
    defaultEnabled: false,
    label: 'Commercial onboarding',
    description: 'Ticari başvuru formları, belge yükleme ve durum ekranı.',
  },
  {
    key: 'enableCommercialApprovalGate',
    phase: 3,
    defaultEnabled: false,
    label: 'Commercial approval gate',
    description: 'Onaysız ticari hesaplar için ilan kısıt katmanı.',
  },
  {
    key: 'enableListingComplianceStep',
    phase: 2,
    defaultEnabled: false,
    label: 'Listing compliance step',
    description: 'İlan oluşturma akışında sahiplik / yetki beyanı adımı.',
  },
  {
    key: 'enableSafePaymentGuidance',
    phase: 2,
    defaultEnabled: false,
    label: 'Safe payment guidance',
    description: 'Resmi güvenli ödeme yönlendirmesi ve kabul kaydı.',
  },
  {
    key: 'enableRiskDetection',
    phase: 1,
    defaultEnabled: false,
    label: 'Risk detection',
    description: 'Duplicate plate, anormal fiyat ve davranış heuristikleri.',
  },
  {
    key: 'enablePaidListings',
    phase: 4,
    defaultEnabled: false,
    label: 'Paid listings',
    description: 'Ücretli ilan akışı ve ilan bazlı tahsilat ön hazırlığı.',
  },
  {
    key: 'enableSubscriptions',
    phase: 4,
    defaultEnabled: false,
    label: 'Subscriptions',
    description: 'Abonelik paketleri ve segment bazlı ücretlendirme.',
  },
  {
    key: 'enableAdminEvidenceExports',
    phase: 1,
    defaultEnabled: false,
    label: 'Evidence exports',
    description: 'Audit ve delil paketlerini export etme araçları.',
  },
];
