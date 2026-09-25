export type ArtworkStatus = 'available' | 'reserved' | 'sold';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'expired';

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  year: number | null;
  price_kes: number;
  status: ArtworkStatus;
  is_published: boolean;
  is_featured: boolean;
  images: string[];
  reserved_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  artwork_id: string | null;
  artwork_title: string;
  artwork_price_kes: number;
  delivery_method: string | null;
  delivery_fee_kes: number | null;
  total_kes: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress | null;
  notes: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
