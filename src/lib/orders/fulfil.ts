import 'server-only';
import type Stripe from 'stripe';
import {revalidatePath} from 'next/cache';
import {getStripe} from '../stripe';
import {createSupabaseServiceClient} from '../supabase/server';

function refreshShop(slug?: string) {
  revalidatePath('/');
  revalidatePath('/artworks');
  if (slug) revalidatePath(`/artworks/${slug}`);
  revalidatePath('/admin', 'layout');
}

/** Payment confirmed: record the buyer and mark the piece sold. Idempotent. */
export async function markOrderPaid(sessionId: string) {
  const db = createSupabaseServiceClient();
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ['shipping_cost.shipping_rate'],
  });
  const orderId = session.metadata?.order_id;
  if (!orderId || session.payment_status !== 'paid') return;

  const {data: order} = await db
    .from('orders')
    .select('id, status, artwork_id')
    .eq('id', orderId)
    .maybeSingle();
  // An expired order can still arrive here if Stripe's events came out of
  // order; Stripe says it is paid, so it is paid.
  if (!order || !['pending', 'expired'].includes(order.status)) return; // already handled

  const rate = session.shipping_cost?.shipping_rate as Stripe.ShippingRate | null | undefined;
  const shipping = session.collected_information?.shipping_details;
  const customer = session.customer_details;

  // Guard against the (unlikely) case of a second payment for a piece that
  // already sold — flag it so the artist can refund.
  const {count: otherSales} = await db
    .from('orders')
    .select('id', {count: 'exact', head: true})
    .eq('artwork_id', order.artwork_id)
    .in('status', ['paid', 'shipped', 'delivered'])
    .neq('id', orderId);
  const {data: held} = await db
    .from('artworks')
    .select('status, reserved_order_id')
    .eq('id', order.artwork_id)
    .maybeSingle();
  const alreadySold =
    Boolean(otherSales) ||
    (held?.status === 'reserved' && held.reserved_order_id !== orderId);

  await db
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      customer_name: shipping?.name ?? customer?.name ?? null,
      customer_email: customer?.email ?? null,
      customer_phone: customer?.phone ?? null,
      shipping_address: shipping?.address ?? customer?.address ?? null,
      delivery_method: rate?.display_name ?? null,
      delivery_fee_kes: (session.shipping_cost?.amount_total ?? 0) / 100,
      total_kes: (session.amount_total ?? 0) / 100,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      notes: alreadySold
        ? 'Warning: this piece was already sold or held for another buyer. Check both orders and refund one in Stripe.'
        : '',
    })
    .eq('id', orderId)
    .in('status', ['pending', 'expired']);

  const {data: artwork} = await db
    .from('artworks')
    .update({status: 'sold', reserved_until: null, reserved_order_id: null})
    .eq('id', order.artwork_id)
    .select('slug')
    .maybeSingle();

  refreshShop(artwork?.slug);
}

/** Checkout abandoned or payment failed: free the piece for other buyers. */
export async function markOrderExpired(orderId: string) {
  const db = createSupabaseServiceClient();
  const {data: order} = await db
    .from('orders')
    .update({status: 'expired'})
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('artwork_id')
    .maybeSingle();
  await db.rpc('release_artwork', {p_order_id: orderId});
  if (order) refreshShop();
}
