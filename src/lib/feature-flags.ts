function readBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return String(value).trim().toLowerCase() === 'true';
}

export const webFeatureFlags = {
  enableCommercialOnboarding: readBoolean(
    process.env.NEXT_PUBLIC_FEATURE_ENABLE_COMMERCIAL_ONBOARDING,
    false,
  ),
  enableListingComplianceStep: true,
  enableSafePaymentGuidance: true,
  enablePaidListings: readBoolean(process.env.NEXT_PUBLIC_FEATURE_ENABLE_PAID_LISTINGS, false),
  enableSubscriptions: readBoolean(process.env.NEXT_PUBLIC_FEATURE_ENABLE_SUBSCRIPTIONS, false),
};
