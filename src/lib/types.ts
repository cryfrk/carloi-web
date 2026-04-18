export type PostType = 'standard' | 'listing';

export interface MediaAsset {
  id: string;
  kind: 'image' | 'video' | 'gif' | 'report';
  label: string;
  hint: string;
  uri?: string;
  tone?: string;
}

export interface ListingFact {
  label: string;
  value: string;
}

export interface ListingStats {
  views: number;
  saves: number;
  shares: number;
  messages: number;
  calls: number;
}

export interface ListingRegistrationInfo {
  ownerName: string;
  ownerIdentityNumber: string;
  serialNumber: string;
  documentNumber: string;
  plateNumber: string;
}

export interface ListingDetails {
  title: string;
  price: string;
  location: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  sellerName: string;
  sellerHandle: string;
  description: string;
  summaryLine: string;
  listingLink: string;
  badges: string[];
  factorySpecs: string[];
  reportHighlights: string[];
  specTable: ListingFact[];
  conditionTable: ListingFact[];
  equipment: string[];
  extraEquipment?: string;
  showExpertiz: boolean;
  isSold?: boolean;
  soldAt?: string;
  registrationInfo?: ListingRegistrationInfo;
  stats: ListingStats;
}

export interface PostComment {
  id: string;
  authorName: string;
  handle: string;
  authorAvatarUri?: string;
  content: string;
  time: string;
}

export interface SearchResultUser {
  id: string;
  name: string;
  handle: string;
  note: string;
  avatarUri?: string;
  coverUri?: string;
  profileLink?: string;
}

export interface Post {
  id: string;
  authorName: string;
  handle: string;
  role: string;
  time: string;
  createdAt: string;
  authorAvatarUri?: string;
  content: string;
  hashtags: string[];
  media: MediaAsset[];
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
  views: number;
  type: PostType;
  likedByUser?: boolean;
  savedByUser?: boolean;
  repostedByUser?: boolean;
  listing?: ListingDetails;
  commentList: PostComment[];
  shareLink: string;
  lastEditedAt?: string;
}

export interface MessageAttachment {
  id: string;
  kind: 'image' | 'video' | 'audio' | 'location';
  label: string;
  uri?: string;
  mimeType?: string;
  durationMs?: number;
  latitude?: number;
  longitude?: number;
  city?: string;
  district?: string;
  locationLine?: string;
}

export interface ConversationMessage {
  id: string;
  senderHandle: string;
  senderName: string;
  text: string;
  time: string;
  isMine: boolean;
  attachments?: MessageAttachment[];
  editedAt?: string;
  isDeletedForEveryone?: boolean;
  canEdit?: boolean;
  canDeleteForEveryone?: boolean;
}

export interface ListingConversationContext {
  postId: string;
  title: string;
  price: string;
  location: string;
  summaryLine: string;
  sellerHandle: string;
  sellerName: string;
  previewImageUri?: string;
}

export interface ListingConversationAgreement {
  buyerAgreed: boolean;
  sellerAgreed: boolean;
  myRole: 'buyer' | 'seller';
  myAgreed: boolean;
  counterpartyAgreed: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'listing';
  name: string;
  handle: string;
  unread: number;
  isOnline: boolean;
  lastMessage: string;
  lastSeen: string;
  participantHandles: string[];
  participantNames: string[];
  avatarUri?: string;
  messages: ConversationMessage[];
  listingContext?: ListingConversationContext;
  agreement?: ListingConversationAgreement;
  insuranceStatus?: {
    registrationSharedAt?: string;
    paymentStatus?: 'missing' | 'awaiting_quote' | 'quoted' | 'payment_pending' | 'paid' | 'processing' | 'policy_sent';
    quoteAmount?: string;
    policySentAt?: string;
  };
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedPostIds?: string[];
  provider?: string;
  editedAt?: string;
  canEdit?: boolean;
}

export interface SocialProfile {
  name: string;
  handle: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  soldListings?: number;
  verified: boolean;
  avatarUri?: string;
  coverUri?: string;
  followingHandles: string[];
}

export interface LiveMetric {
  id: string;
  label: string;
  value: string;
  helper: string;
}

export interface FaultCode {
  code: string;
  title: string;
  severity: 'Dikkat' | 'Orta' | 'Yuksek';
  detail: string;
}

export interface PartPrediction {
  name: string;
  probability: number;
  marketPrice: string;
  repairCost: string;
  explanation: string;
}

export interface VehicleProfile {
  brand: string;
  model: string;
  year: string;
  packageName: string;
  mileage: string;
  engineVolume: string;
  vin: string;
  fuelType?: string;
  obdConnected: boolean;
  obdLastSyncAt?: string;
  healthScore?: number;
  driveScore?: number;
  liveMetrics: LiveMetric[];
  faultCodes: FaultCode[];
  probableFaultyParts: PartPrediction[];
  upcomingRisks: PartPrediction[];
  summary: string;
  actions: string[];
  equipment: string[];
  extraEquipment?: string;
}

export interface UserSettings {
  membershipPlan: string;
  membershipSource?: string;
  membershipProductId?: string;
  membershipActivatedAt?: string;
  membershipExpiresAt?: string;
  email: string;
  phone: string;
  legalFullName: string;
  identityNumber: string;
  birthDate: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string;
  defaultPlateNumber: string;
  registrationOwnerName: string;
  registrationOwnerIdentityNumber: string;
  registrationSerialNumber: string;
  registrationDocumentNumber: string;
  language: 'tr' | 'en';
  privateProfile: boolean;
  allowMessageRequests: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  biometricLock: boolean;
  twoFactorEnabled: boolean;
  aiDataSharing: boolean;
  showSavedAdsOnProfile: boolean;
  showLastSeen: boolean;
  allowCalls: boolean;
  autoplayVideo: boolean;
  quickLoginEnabled: boolean;
  useDeviceLocation: boolean;
  shareLocationWithAi: boolean;
  showSoldCountOnProfile: boolean;
}

export interface AuthState {
  isRegistered: boolean;
  isAuthenticated: boolean;
  email: string;
  phone: string;
  passwordHash: string;
  sessionToken?: string;
  registeredAt?: string;
  lastLoginAt?: string;
}

export interface AppSnapshot {
  auth: AuthState;
  profile: SocialProfile;
  vehicle?: VehicleProfile;
  settings: UserSettings;
  posts: Post[];
  conversations: Conversation[];
  aiMessages: AIMessage[];
  profileSegment: 'paylasimlar' | 'ilanlar' | 'kaydedilenler' | 'ayarlar';
  directoryUsers: SearchResultUser[];
}

export interface PublicProfilePayload {
  profile: Omit<SocialProfile, 'followingHandles'> & { id: string; profileLink: string };
  posts: Post[];
  listings: Post[];
  followers: SearchResultUser[];
  following: SearchResultUser[];
}

export interface BackendResponse<T = unknown> {
  success: boolean;
  message?: string;
  token?: string;
  snapshot?: AppSnapshot;
  post?: Post;
  profile?: PublicProfilePayload['profile'];
  posts?: Post[];
  listings?: Post[];
  followers?: SearchResultUser[];
  following?: SearchResultUser[];
  email?: string;
  expiresAt?: string;
  maskedDestination?: string;
  deliveryFailed?: boolean;
  provider?: string;
  relatedPostIds?: string[];
  url?: string;
}
