export type Channel = 'TELEGRAM' | 'BALE';

export type PaymentProvider = 'ZIBAL' | 'NOWPAYMENTS';

export type PaymentStatus =
  | 'PENDING'
  | 'REDIRECTED'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED';

export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'CANCELED';

export type DeliveryMethod = 'POST' | 'COURIER_TEHRAN';

export interface ShippingOptionDto {
  id: DeliveryMethod;
  title: string;
  description: string;
  shippingRial: number;
}

export interface AuthSession {
  token: string;
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  province: string | null;
  city: string | null;
  street: string | null;
  postalCode: string | null;
  telegram?: {
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  bale?: {
    baleId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface MagazineDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  issues: IssueDto[];
}

export interface IssueDto {
  id: string;
  title: string;
  number: number;
  priceRial: number;
  originalPriceRial: number | null;
  coverUrl: string | null;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  totalRial: number;
  shippingRial: number;
  grandTotalRial: number;
}

export interface CartItemDto {
  id: string;
  issueId: string;
  title: string;
  number: number;
  priceRial: number;
  qty: number;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  phone: string;
  notes?: string;
}

export interface SavedAddressDto extends CheckoutAddress {
  id: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  amountRial: number;
  amountUsd: string | null;
  shippingRial: number;
  deliveryMethod: DeliveryMethod;
  items: OrderItemDto[];
  firstName: string | null;
  lastName: string | null;
  province: string | null;
  city: string | null;
  street: string | null;
  postalCode: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
}

export interface OrderItemDto {
  id: string;
  title: string;
  priceRial: number;
  qty: number;
}

export interface PaymentIntentDto {
  paymentId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  redirectUrl: string | null;
}

export interface TelegramAuthRequest {
  initData: string;
}

export interface BaleAuthRequest {
  initData: string;
}

export interface OtpSendRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface CreatePaymentIntentRequest {
  orderId: string;
  provider: PaymentProvider;
}

export interface AdminPublic {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN';
}

export interface AdminSession {
  token: string;
  admin: AdminPublic;
}

export interface AdminStats {
  customers: number;
  paidOrders: number;
  pendingPayments: number;
}
