export type Identity = {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
};

export type CustomerRow = {
  id: string;
  phone: string | null;
  createdAt: string;
  telegram: (Identity & { telegramId: string }) | null;
  bale: (Identity & { baleId: string }) | null;
  ordersCount: number;
  notesCount: number;
};

export type CustomerNote = {
  id: string;
  body: string;
  createdAt: string;
  admin: { id: string; name: string; email: string };
};

export type OrderItemRow = {
  id: string;
  title: string;
  priceRial: number;
  qty: number;
};

export type PaymentRow = {
  id: string;
  provider: 'ZIBAL' | 'NOWPAYMENTS';
  status: string;
  amountRial: number;
  externalId: string | null;
  createdAt: string;
};

export type OrderRow = {
  id: string;
  status: string;
  amountRial: number;
  shippingRial?: number;
  firstName?: string | null;
  lastName?: string | null;
  province?: string | null;
  city?: string | null;
  street?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
  user?: CustomerRow | { id: string; phone: string | null; telegram: Identity | null; bale: Identity | null };
  items?: OrderItemRow[];
  payments?: PaymentRow[];
};

export type IssueRow = {
  id: string;
  magazineId: string;
  title: string;
  number: number;
  priceRial: number;
  originalPriceRial: number | null;
  coverUrl: string | null;
  pdfKey: string | null;
};

export type MagazineRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  viewCount: number;
  issues: IssueRow[];
};

export type AdminComment = {
  id: string;
  body: string;
  guestName: string | null;
  stars: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminReply: string | null;
  helpfulUp: number;
  helpfulDown: number;
  createdAt: string;
  issue: { id: string; title: string; number: number; magazine: { title: string } };
  user: { phone: string | null; telegram: { username: string | null } | null; bale: { username: string | null } | null } | null;
  repliedBy: { id: string; name: string } | null;
};

export type AnalyticsOverview = {
  from: string;
  to: string;
  channel: string;
  events: number;
  sessions: number;
  users: number;
  paidOrders: number;
  revenueRial: number;
  pendingComments: number;
  conversion: {
    views: number;
    carts: number;
    checkouts: number;
    purchases: number;
    viewToCart: number;
    cartToCheckout: number;
    checkoutToPurchase: number;
  };
  eventBreakdown: { name: string; count: number }[];
  timeline: { date: string; views: number; carts: number; purchases: number }[];
  channels: { channel: string; events: number }[];
};

export type ReportSnapshot = {
  id: string;
  periodType: string;
  from: string;
  to: string;
  channel: string | null;
  summary: AnalyticsOverview;
  createdAt: string;
  createdBy: { name: string };
};

export type AdminNotification = { id: string; title: string; body: string; readAt: string | null; createdAt: string };

export type AdminAuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: { name: string; email: string };
};

export type PromotionCampaign = {
  id: string;
  active: boolean;
  code: string;
  discountPercent: number;
  title: string;
  description: string;
  updatedAt: string;
};

export type DeliverySettings = {
  id: string;
  postShippingRial: number;
  courierTehranEnabled: boolean;
  courierTehranRial: number;
  updatedAt: string;
};
