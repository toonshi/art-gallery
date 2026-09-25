/**
 * Shop settings. Edit these to match the studio — they are read by the
 * storefront, the admin, and Stripe Checkout.
 */
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Nick Arts',
  tagline: 'Original paintings and works on paper',
  intro:
    'Every piece here is a one-of-a-kind original, painted in the studio and delivered across Kenya.',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
};

/** Delivery choices shown in Stripe Checkout, in whole KES. */
export const deliveryOptions = [
  {id: 'nairobi', label: 'Delivery within Nairobi', feeKes: 500, minDays: 1, maxDays: 3},
  {id: 'kenya', label: 'Delivery elsewhere in Kenya', feeKes: 1500, minDays: 2, maxDays: 7},
  {id: 'pickup', label: 'Collect from the studio', feeKes: 0, minDays: 1, maxDays: 2},
] as const;

/** How long a piece is held for a buyer who is in checkout. Stripe requires 30–1440. */
export const reservationMinutes = 30;

export const currency = 'kes';
