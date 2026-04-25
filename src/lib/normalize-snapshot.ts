import type {
  AIMessage,
  AppSnapshot,
  CommercialDocumentSummary,
  CommercialStatusSummary,
  Conversation,
  ConversationMessage,
  ListingConversationAgreement,
  ListingConversationContext,
  ListingDetails,
  ListingFact,
  ListingStats,
  MessageAttachment,
  Post,
  PostComment,
  PublicProfilePayload,
  SearchResultUser,
  SocialProfile,
  UserSettings,
} from '@/lib/types';

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asPostMediaKind(value: unknown): Post['media'][number]['kind'] {
  return value === 'video' || value === 'gif' || value === 'report' ? value : 'image';
}

function asAttachmentKind(value: unknown): MessageAttachment['kind'] {
  return value === 'video' || value === 'audio' || value === 'location' || value === 'report'
    ? value
    : 'image';
}

function normalizeFacts(value: unknown): ListingFact[] {
  return asArray<Record<string, unknown>>(value)
    .map((item) => ({
      label: asString(item.label),
      value: asString(item.value),
    }))
    .filter((item) => item.label || item.value);
}

function normalizeMessageAttachments(value: unknown): MessageAttachment[] {
  return asArray<Record<string, unknown>>(value).map((item, index) => ({
    id: asString(item.id, `attachment-${index}`),
    kind: asAttachmentKind(item.kind),
    label: asString(item.label, 'Ek'),
    uri: asString(item.uri) || undefined,
    mimeType: asString(item.mimeType) || undefined,
    durationMs: typeof item.durationMs === 'number' ? item.durationMs : undefined,
    latitude: typeof item.latitude === 'number' ? item.latitude : undefined,
    longitude: typeof item.longitude === 'number' ? item.longitude : undefined,
    city: asString(item.city) || undefined,
    district: asString(item.district) || undefined,
    locationLine: asString(item.locationLine) || undefined,
  }));
}

function normalizeComments(value: unknown): PostComment[] {
  return asArray<Record<string, unknown>>(value).map((item, index) => ({
    id: asString(item.id, `comment-${index}`),
    authorName: asString(item.authorName, 'Carloi'),
    handle: asString(item.handle, '@carloi'),
    authorAvatarUri: asString(item.authorAvatarUri) || undefined,
    content: asString(item.content),
    time: asString(item.time),
  }));
}

function normalizeListingStats(value: unknown): ListingStats {
  const source = (value as Record<string, unknown>) || {};
  return {
    views: asNumber(source.views),
    saves: asNumber(source.saves),
    shares: asNumber(source.shares),
    messages: asNumber(source.messages),
    calls: asNumber(source.calls),
  };
}

export function normalizeListing(value: unknown): ListingDetails | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  return {
    title: asString(source.title, 'Adsiz ilan'),
    price: asString(source.price, 'Fiyat belirtilmedi'),
    location: asString(source.location, 'Konum belirtilmedi'),
    city: asString(source.city),
    district: asString(source.district),
    latitude: typeof source.latitude === 'number' ? source.latitude : undefined,
    longitude: typeof source.longitude === 'number' ? source.longitude : undefined,
    contactPhone: asString(source.contactPhone) || undefined,
    sellerName: asString(source.sellerName, 'Carloi kullanicisi'),
    sellerHandle: asString(source.sellerHandle, '@carloi'),
    description: asString(source.description),
    summaryLine: asString(source.summaryLine),
    listingLink: asString(source.listingLink),
    badges: asArray<string>(source.badges).filter(Boolean),
    factorySpecs: asArray<string>(source.factorySpecs).filter(Boolean),
    reportHighlights: asArray<string>(source.reportHighlights).filter(Boolean),
    specTable: normalizeFacts(source.specTable),
    conditionTable: normalizeFacts(source.conditionTable),
    equipment: asArray<string>(source.equipment).filter(Boolean),
    extraEquipment: asString(source.extraEquipment) || undefined,
    showExpertiz: asBoolean(source.showExpertiz),
    isSold: typeof source.isSold === 'boolean' ? source.isSold : undefined,
    soldAt: asString(source.soldAt) || undefined,
    registrationInfo:
      source.registrationInfo && typeof source.registrationInfo === 'object'
        ? {
            ownerName: asString((source.registrationInfo as Record<string, unknown>).ownerName),
            ownerIdentityNumber: asString(
              (source.registrationInfo as Record<string, unknown>).ownerIdentityNumber,
            ),
            serialNumber: asString((source.registrationInfo as Record<string, unknown>).serialNumber),
            documentNumber: asString(
              (source.registrationInfo as Record<string, unknown>).documentNumber,
            ),
            plateNumber: asString((source.registrationInfo as Record<string, unknown>).plateNumber),
          }
        : undefined,
    complianceStatus: source.complianceStatus as ListingDetails['complianceStatus'],
    authorizationStatus: source.authorizationStatus as ListingDetails['authorizationStatus'],
    eidsStatus: source.eidsStatus as ListingDetails['eidsStatus'],
    riskScore: typeof source.riskScore === 'number' ? source.riskScore : undefined,
    riskLevel: source.riskLevel as ListingDetails['riskLevel'],
    reviewRequiredReason: asString(source.reviewRequiredReason) || undefined,
    duplicatePlateFlag:
      typeof source.duplicatePlateFlag === 'boolean' ? source.duplicatePlateFlag : undefined,
    abnormalPriceFlag:
      typeof source.abnormalPriceFlag === 'boolean' ? source.abnormalPriceFlag : undefined,
    spamContentFlag: typeof source.spamContentFlag === 'boolean' ? source.spamContentFlag : undefined,
    billingStatus: source.billingStatus as ListingDetails['billingStatus'],
    stats: normalizeListingStats(source.stats),
  };
}

export function normalizePost(value: unknown): Post {
  const source = (value as Record<string, unknown>) || {};
  const media = asArray<Record<string, unknown>>(source.media).map((item, index) => ({
    id: asString(item.id, `media-${index}`),
    kind: asPostMediaKind(item.kind),
    label: asString(item.label, 'Medya'),
    hint: asString(item.hint),
    uri: asString(item.uri) || undefined,
    tone: asString(item.tone) || undefined,
  }));

  return {
    id: asString(source.id, `post-${Date.now()}`),
    authorName: asString(source.authorName, 'Carloi'),
    handle: asString(source.handle, '@carloi'),
    role: asString(source.role),
    time: asString(source.time),
    createdAt: asString(source.createdAt),
    authorAvatarUri: asString(source.authorAvatarUri) || undefined,
    content: asString(source.content),
    hashtags: asArray<string>(source.hashtags).filter(Boolean),
    media,
    likes: asNumber(source.likes),
    comments: asNumber(source.comments),
    reposts: asNumber(source.reposts),
    shares: asNumber(source.shares),
    views: asNumber(source.views),
    type: source.type === 'listing' ? 'listing' : 'standard',
    likedByUser: typeof source.likedByUser === 'boolean' ? source.likedByUser : false,
    savedByUser: typeof source.savedByUser === 'boolean' ? source.savedByUser : false,
    repostedByUser: typeof source.repostedByUser === 'boolean' ? source.repostedByUser : false,
    listing: normalizeListing(source.listing),
    commentList: normalizeComments(source.commentList),
    shareLink: asString(source.shareLink),
    lastEditedAt: asString(source.lastEditedAt) || undefined,
  };
}

function normalizeConversationContext(value: unknown): ListingConversationContext | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  return {
    postId: asString(source.postId),
    title: asString(source.title, 'Ilan'),
    price: asString(source.price, 'Fiyat belirtilmedi'),
    location: asString(source.location, 'Konum belirtilmedi'),
    summaryLine: asString(source.summaryLine),
    sellerHandle: asString(source.sellerHandle, '@carloi'),
    sellerName: asString(source.sellerName, 'Carloi kullanicisi'),
    previewImageUri: asString(source.previewImageUri) || undefined,
  };
}

function normalizeConversationAgreement(value: unknown): ListingConversationAgreement | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  return {
    buyerAgreed: asBoolean(source.buyerAgreed),
    sellerAgreed: asBoolean(source.sellerAgreed),
    myRole: source.myRole === 'seller' ? 'seller' : 'buyer',
    myAgreed: asBoolean(source.myAgreed),
    counterpartyAgreed: asBoolean(source.counterpartyAgreed),
  };
}

function normalizeConversationMessages(value: unknown): ConversationMessage[] {
  return asArray<Record<string, unknown>>(value).map((item, index) => ({
    id: asString(item.id, `message-${index}`),
    senderHandle: asString(item.senderHandle, '@carloi'),
    senderName: asString(item.senderName, 'Carloi'),
    text: asString(item.text),
    time: asString(item.time),
    isMine: asBoolean(item.isMine),
    attachments: normalizeMessageAttachments(item.attachments),
    editedAt: asString(item.editedAt) || undefined,
    isDeletedForEveryone:
      typeof item.isDeletedForEveryone === 'boolean' ? item.isDeletedForEveryone : undefined,
    canEdit: typeof item.canEdit === 'boolean' ? item.canEdit : undefined,
    canDeleteForEveryone:
      typeof item.canDeleteForEveryone === 'boolean' ? item.canDeleteForEveryone : undefined,
  }));
}

export function normalizeConversation(value: unknown): Conversation {
  const source = (value as Record<string, unknown>) || {};
  return {
    id: asString(source.id, `conversation-${Date.now()}`),
    type:
      source.type === 'group' || source.type === 'listing'
        ? source.type
        : 'direct',
    name: asString(source.name, 'Konusma'),
    handle: asString(source.handle),
    unread: asNumber(source.unread),
    isOnline: asBoolean(source.isOnline),
    lastMessage: asString(source.lastMessage),
    lastSeen: asString(source.lastSeen),
    participantHandles: asArray<string>(source.participantHandles).filter(Boolean),
    participantNames: asArray<string>(source.participantNames).filter(Boolean),
    avatarUri: asString(source.avatarUri) || undefined,
    messages: normalizeConversationMessages(source.messages),
    listingContext: normalizeConversationContext(source.listingContext),
    agreement: normalizeConversationAgreement(source.agreement),
    insuranceStatus:
      source.insuranceStatus && typeof source.insuranceStatus === 'object'
        ? {
            registrationSharedAt:
              asString((source.insuranceStatus as Record<string, unknown>).registrationSharedAt) ||
              undefined,
            registrationInfo:
              (source.insuranceStatus as Record<string, unknown>).registrationInfo &&
              typeof (source.insuranceStatus as Record<string, unknown>).registrationInfo === 'object'
                ? {
                    ownerName: asString(
                      ((source.insuranceStatus as Record<string, unknown>).registrationInfo as Record<
                        string,
                        unknown
                      >).ownerName,
                    ),
                    ownerIdentityNumber: asString(
                      ((source.insuranceStatus as Record<string, unknown>).registrationInfo as Record<
                        string,
                        unknown
                      >).ownerIdentityNumber,
                    ),
                    serialNumber: asString(
                      ((source.insuranceStatus as Record<string, unknown>).registrationInfo as Record<
                        string,
                        unknown
                      >).serialNumber,
                    ),
                    documentNumber: asString(
                      ((source.insuranceStatus as Record<string, unknown>).registrationInfo as Record<
                        string,
                        unknown
                      >).documentNumber,
                    ),
                    plateNumber: asString(
                      ((source.insuranceStatus as Record<string, unknown>).registrationInfo as Record<
                        string,
                        unknown
                      >).plateNumber,
                    ),
                  }
                : undefined,
            paymentStatus: (source.insuranceStatus as Record<string, unknown>).paymentStatus as
              | NonNullable<Conversation['insuranceStatus']>['paymentStatus']
              | undefined,
            quoteAmount:
              asString((source.insuranceStatus as Record<string, unknown>).quoteAmount) || undefined,
            invoiceUri:
              asString((source.insuranceStatus as Record<string, unknown>).invoiceUri) || undefined,
            policyUri:
              asString((source.insuranceStatus as Record<string, unknown>).policyUri) || undefined,
            policySentAt:
              asString((source.insuranceStatus as Record<string, unknown>).policySentAt) || undefined,
            invoiceSentAt:
              asString((source.insuranceStatus as Record<string, unknown>).invoiceSentAt) || undefined,
          }
        : undefined,
    saleProcess:
      source.saleProcess && typeof source.saleProcess === 'object'
        ? {
            id: asString((source.saleProcess as Record<string, unknown>).id),
            listingId: asString((source.saleProcess as Record<string, unknown>).listingId),
            buyerUserId: asString((source.saleProcess as Record<string, unknown>).buyerUserId),
            sellerUserId: asString((source.saleProcess as Record<string, unknown>).sellerUserId),
            status: ((source.saleProcess as Record<string, unknown>).status ||
              'interest') as NonNullable<Conversation['saleProcess']>['status'],
            safePaymentInfoAcceptedAt:
              asString((source.saleProcess as Record<string, unknown>).safePaymentInfoAcceptedAt) ||
              undefined,
            safePaymentReferenceCode:
              asString((source.saleProcess as Record<string, unknown>).safePaymentReferenceCode) ||
              undefined,
            safePaymentProviderName:
              asString((source.saleProcess as Record<string, unknown>).safePaymentProviderName) ||
              undefined,
            safePaymentStatusNote:
              asString((source.saleProcess as Record<string, unknown>).safePaymentStatusNote) ||
              undefined,
            guidanceEnabled: asBoolean((source.saleProcess as Record<string, unknown>).guidanceEnabled),
            requiresGuidanceAcknowledgement: asBoolean(
              (source.saleProcess as Record<string, unknown>).requiresGuidanceAcknowledgement,
            ),
          }
        : undefined,
  };
}

function normalizeAiMessages(value: unknown): AIMessage[] {
  return asArray<Record<string, unknown>>(value).map((item, index) => ({
    id: asString(item.id, `ai-${index}`),
    role: item.role === 'user' ? 'user' : 'assistant',
    content: asString(item.content),
    relatedPostIds: asArray<string>(item.relatedPostIds).filter(Boolean),
    provider: asString(item.provider) || undefined,
    editedAt: asString(item.editedAt) || undefined,
    canEdit: typeof item.canEdit === 'boolean' ? item.canEdit : undefined,
  }));
}

function normalizeProfile(value: unknown): SocialProfile {
  const source = (value as Record<string, unknown>) || {};
  return {
    name: asString(source.name, 'Carloi kullanicisi'),
    handle: asString(source.handle, '@carloi'),
    bio: asString(source.bio),
    followers: asNumber(source.followers),
    following: asNumber(source.following),
    posts: asNumber(source.posts),
    soldListings: typeof source.soldListings === 'number' ? source.soldListings : undefined,
    verified: asBoolean(source.verified),
    avatarUri: asString(source.avatarUri) || undefined,
    coverUri: asString(source.coverUri) || undefined,
    followingHandles: asArray<string>(source.followingHandles).filter(Boolean),
  };
}

function normalizeDirectoryUsers(value: unknown): SearchResultUser[] {
  return asArray<Record<string, unknown>>(value).map((item, index) => ({
    id: asString(item.id, `user-${index}`),
    name: asString(item.name, 'Carloi kullanicisi'),
    handle: asString(item.handle, '@carloi'),
    note: asString(item.note),
    avatarUri: asString(item.avatarUri) || undefined,
    coverUri: asString(item.coverUri) || undefined,
    profileLink: asString(item.profileLink) || undefined,
  }));
}

function normalizeSettings(value: unknown): UserSettings {
  const source = (value as Record<string, unknown>) || {};
  return {
    membershipPlan: asString(source.membershipPlan, 'Standart'),
    membershipSource: source.membershipSource as UserSettings['membershipSource'],
    membershipProductId: asString(source.membershipProductId) || undefined,
    membershipActivatedAt: asString(source.membershipActivatedAt) || undefined,
    membershipExpiresAt: asString(source.membershipExpiresAt) || undefined,
    email: asString(source.email),
    phone: asString(source.phone),
    legalFullName: asString(source.legalFullName),
    identityNumber: asString(source.identityNumber),
    birthDate: asString(source.birthDate),
    addressLine: asString(source.addressLine),
    city: asString(source.city),
    district: asString(source.district),
    postalCode: asString(source.postalCode),
    defaultPlateNumber: asString(source.defaultPlateNumber),
    registrationOwnerName: asString(source.registrationOwnerName),
    registrationOwnerIdentityNumber: asString(source.registrationOwnerIdentityNumber),
    registrationSerialNumber: asString(source.registrationSerialNumber),
    registrationDocumentNumber: asString(source.registrationDocumentNumber),
    language: source.language === 'en' ? 'en' : 'tr',
    privateProfile: asBoolean(source.privateProfile),
    allowMessageRequests: asBoolean(source.allowMessageRequests, true),
    pushNotifications: asBoolean(source.pushNotifications, true),
    emailNotifications: asBoolean(source.emailNotifications, true),
    smsNotifications: asBoolean(source.smsNotifications),
    biometricLock: asBoolean(source.biometricLock),
    twoFactorEnabled: asBoolean(source.twoFactorEnabled),
    aiDataSharing: asBoolean(source.aiDataSharing),
    showSavedAdsOnProfile: asBoolean(source.showSavedAdsOnProfile),
    showLastSeen: asBoolean(source.showLastSeen, true),
    allowCalls: asBoolean(source.allowCalls, true),
    autoplayVideo: asBoolean(source.autoplayVideo, true),
    quickLoginEnabled: asBoolean(source.quickLoginEnabled),
    useDeviceLocation: asBoolean(source.useDeviceLocation),
    shareLocationWithAi: asBoolean(source.shareLocationWithAi),
    showSoldCountOnProfile: asBoolean(source.showSoldCountOnProfile, true),
  };
}

function normalizeCommercialDocuments(value: unknown): CommercialDocumentSummary[] {
  return asArray<Record<string, unknown>>(value).map((item, index) => ({
    id: asString(item.id, `document-${index}`),
    userId: asString(item.userId),
    commercialProfileId: asString(item.commercialProfileId),
    type: (item.type || 'other') as CommercialDocumentSummary['type'],
    fileUrl: asString(item.fileUrl),
    originalFileName: asString(item.originalFileName, 'Belge'),
    mimeType: asString(item.mimeType, 'application/pdf'),
    fileSize: asNumber(item.fileSize),
    uploadedAt: asString(item.uploadedAt),
    status: (item.status || 'uploaded') as CommercialDocumentSummary['status'],
    reviewedByAdminId: asString(item.reviewedByAdminId) || undefined,
    reviewedAt: asString(item.reviewedAt) || undefined,
    rejectReason: asString(item.rejectReason) || undefined,
    verificationMethod: (item.verificationMethod || 'manual_admin_review') as
      CommercialDocumentSummary['verificationMethod'],
    suspiciousFlag: asBoolean(item.suspiciousFlag),
  }));
}

function normalizeCommercial(value: unknown): CommercialStatusSummary {
  const source = (value as Record<string, unknown>) || {};
  return {
    enabled: asBoolean(source.enabled),
    accountType: source.accountType === 'commercial' ? 'commercial' : 'individual',
    commercialStatus: (source.commercialStatus || 'not_applied') as CommercialStatusSummary['commercialStatus'],
    canUseCommercialListingFeatures: asBoolean(source.canUseCommercialListingFeatures),
    pendingReview: asBoolean(source.pendingReview),
    additionalVerificationRequired: asBoolean(source.additionalVerificationRequired),
    yearlyVehicleSaleCount: asNumber(source.yearlyVehicleSaleCount),
    yearlyVehicleListingCount: asNumber(source.yearlyVehicleListingCount),
    commercialBehaviorFlag: asBoolean(source.commercialBehaviorFlag),
    profile:
      source.profile && typeof source.profile === 'object'
        ? {
            id: asString((source.profile as Record<string, unknown>).id),
            userId: asString((source.profile as Record<string, unknown>).userId),
            companyName: asString((source.profile as Record<string, unknown>).companyName),
            taxOrIdentityType:
              (source.profile as Record<string, unknown>).taxOrIdentityType === 'TCKN' ? 'TCKN' : 'VKN',
            taxOrIdentityNumber: asString(
              (source.profile as Record<string, unknown>).taxOrIdentityNumber,
            ),
            tradeName: asString((source.profile as Record<string, unknown>).tradeName) || undefined,
            mersisNumber: asString((source.profile as Record<string, unknown>).mersisNumber) || undefined,
            authorizedPersonName:
              asString((source.profile as Record<string, unknown>).authorizedPersonName) || undefined,
            authorizedPersonTitle:
              asString((source.profile as Record<string, unknown>).authorizedPersonTitle) || undefined,
            phone: asString((source.profile as Record<string, unknown>).phone),
            city: asString((source.profile as Record<string, unknown>).city),
            district: asString((source.profile as Record<string, unknown>).district),
            address: asString((source.profile as Record<string, unknown>).address),
            notes: asString((source.profile as Record<string, unknown>).notes) || undefined,
            status: ((source.profile as Record<string, unknown>).status ||
              'draft') as NonNullable<CommercialStatusSummary['profile']>['status'],
            submittedAt: asString((source.profile as Record<string, unknown>).submittedAt) || undefined,
            documentTruthfulnessAcceptedAt:
              asString(
                (source.profile as Record<string, unknown>).documentTruthfulnessAcceptedAt,
              ) || undefined,
            additionalVerificationAcknowledgedAt:
              asString(
                (source.profile as Record<string, unknown>).additionalVerificationAcknowledgedAt,
              ) || undefined,
            createdAt: asString((source.profile as Record<string, unknown>).createdAt),
            updatedAt: asString((source.profile as Record<string, unknown>).updatedAt),
          }
        : null,
    documents: normalizeCommercialDocuments(source.documents),
    currentDocuments: normalizeCommercialDocuments(source.currentDocuments),
    documentHistory: normalizeCommercialDocuments(source.documentHistory),
    suspiciousDocumentCount: asNumber(source.suspiciousDocumentCount),
    minimumDocumentSet: {
      hasMinimumSet:
        typeof (source.minimumDocumentSet as Record<string, unknown> | undefined)?.hasMinimumSet ===
        'boolean'
          ? Boolean((source.minimumDocumentSet as Record<string, unknown>).hasMinimumSet)
          : false,
      requiredDocumentTypes: asArray<CommercialDocumentSummary['type']>(
        (source.minimumDocumentSet as Record<string, unknown> | undefined)?.requiredDocumentTypes,
      ).filter(Boolean),
    },
    requiredDocumentTypes: asArray<CommercialDocumentSummary['type']>(source.requiredDocumentTypes).filter(Boolean),
    canResubmit: typeof source.canResubmit === 'boolean' ? source.canResubmit : undefined,
    featureRestrictionLevel:
      (source.featureRestrictionLevel as CommercialStatusSummary['featureRestrictionLevel']) || undefined,
    publishingBlockedReason: asString(source.publishingBlockedReason) || undefined,
    nextActions: asArray<string>(source.nextActions).filter(Boolean),
  };
}

export function normalizeAppSnapshot(value: unknown): AppSnapshot | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  return {
    auth: {
      isRegistered: asBoolean((source.auth as Record<string, unknown> | undefined)?.isRegistered),
      isAuthenticated: asBoolean(
        (source.auth as Record<string, unknown> | undefined)?.isAuthenticated,
      ),
      email: asString((source.auth as Record<string, unknown> | undefined)?.email),
      phone: asString((source.auth as Record<string, unknown> | undefined)?.phone),
      passwordHash: asString((source.auth as Record<string, unknown> | undefined)?.passwordHash),
      sessionToken:
        asString((source.auth as Record<string, unknown> | undefined)?.sessionToken) || undefined,
      registeredAt:
        asString((source.auth as Record<string, unknown> | undefined)?.registeredAt) || undefined,
      lastLoginAt:
        asString((source.auth as Record<string, unknown> | undefined)?.lastLoginAt) || undefined,
    },
    profile: normalizeProfile(source.profile),
    commercial: normalizeCommercial(source.commercial),
    admin:
      source.admin && typeof source.admin === 'object'
        ? {
            isAdmin: asBoolean((source.admin as Record<string, unknown>).isAdmin),
            roleKeys: asArray<string>((source.admin as Record<string, unknown>).roleKeys).filter(Boolean),
            permissions: asArray<string>((source.admin as Record<string, unknown>).permissions).filter(Boolean),
          }
        : undefined,
    vehicle:
      source.vehicle && typeof source.vehicle === 'object'
        ? {
            brand: asString((source.vehicle as Record<string, unknown>).brand),
            model: asString((source.vehicle as Record<string, unknown>).model),
            year: asString((source.vehicle as Record<string, unknown>).year),
            packageName: asString((source.vehicle as Record<string, unknown>).packageName),
            mileage: asString((source.vehicle as Record<string, unknown>).mileage),
            engineVolume: asString((source.vehicle as Record<string, unknown>).engineVolume),
            vin: asString((source.vehicle as Record<string, unknown>).vin),
            fuelType: asString((source.vehicle as Record<string, unknown>).fuelType) || undefined,
            obdConnected: asBoolean((source.vehicle as Record<string, unknown>).obdConnected),
            obdLastSyncAt:
              asString((source.vehicle as Record<string, unknown>).obdLastSyncAt) || undefined,
            healthScore:
              typeof (source.vehicle as Record<string, unknown>).healthScore === 'number'
                ? ((source.vehicle as Record<string, unknown>).healthScore as number)
                : undefined,
            driveScore:
              typeof (source.vehicle as Record<string, unknown>).driveScore === 'number'
                ? ((source.vehicle as Record<string, unknown>).driveScore as number)
                : undefined,
            liveMetrics: asArray((source.vehicle as Record<string, unknown>).liveMetrics),
            faultCodes: asArray((source.vehicle as Record<string, unknown>).faultCodes),
            probableFaultyParts: asArray((source.vehicle as Record<string, unknown>).probableFaultyParts),
            upcomingRisks: asArray((source.vehicle as Record<string, unknown>).upcomingRisks),
            summary: asString((source.vehicle as Record<string, unknown>).summary),
            actions: asArray<string>((source.vehicle as Record<string, unknown>).actions).filter(Boolean),
            equipment: asArray<string>((source.vehicle as Record<string, unknown>).equipment).filter(Boolean),
            extraEquipment:
              asString((source.vehicle as Record<string, unknown>).extraEquipment) || undefined,
          }
        : undefined,
    settings: normalizeSettings(source.settings),
    posts: asArray(source.posts).map(normalizePost),
    conversations: asArray(source.conversations).map(normalizeConversation),
    aiMessages: normalizeAiMessages(source.aiMessages),
    profileSegment:
      source.profileSegment === 'ilanlar' ||
      source.profileSegment === 'kaydedilenler' ||
      source.profileSegment === 'ayarlar'
        ? source.profileSegment
        : 'paylasimlar',
    directoryUsers: normalizeDirectoryUsers(source.directoryUsers),
  };
}

export function normalizePublicProfilePayload(value: unknown): PublicProfilePayload | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as PublicProfilePayload;
  return {
    profile: {
      ...normalizeProfile(source.profile),
      id: asString(source.profile?.id),
      profileLink: asString(source.profile?.profileLink),
    },
    posts: asArray(source.posts).map(normalizePost),
    listings: asArray(source.listings).map(normalizePost),
    followers: normalizeDirectoryUsers(source.followers),
    following: normalizeDirectoryUsers(source.following),
  };
}
