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
  coverUrl: string | null;
  pdfKey: string | null;
};

export type MagazineRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  issues: IssueRow[];
};
