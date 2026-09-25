import type {ArtworkStatus, OrderStatus} from './types';

const kes = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

export function formatKes(amount: number): string {
  return kes.format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

type Tone = 'success' | 'warning' | 'error' | 'accent' | 'neutral';

export const artworkStatusMeta: Record<ArtworkStatus, {label: string; tone: Tone}> = {
  available: {label: 'Available', tone: 'success'},
  reserved: {label: 'Reserved', tone: 'warning'},
  sold: {label: 'Sold', tone: 'neutral'},
};

export const orderStatusMeta: Record<OrderStatus, {label: string; tone: Tone}> = {
  pending: {label: 'Awaiting payment', tone: 'neutral'},
  paid: {label: 'Paid — to fulfil', tone: 'warning'},
  shipped: {label: 'Out for delivery', tone: 'accent'},
  delivered: {label: 'Delivered', tone: 'success'},
  cancelled: {label: 'Cancelled', tone: 'error'},
  expired: {label: 'Checkout abandoned', tone: 'neutral'},
};
