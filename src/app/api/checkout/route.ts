import {NextResponse} from 'next/server';
import {z} from 'zod';
import {currency, deliveryOptions, reservationMinutes} from '@/lib/config';
import {isStripeConfigured, isSupabaseConfigured, siteUrl} from '@/lib/env';
import {imageUrl} from '@/lib/images';
import {getStripe} from '@/lib/stripe';
import {createSupabaseServiceClient} from '@/lib/supabase/server';
import type {Artwork} from '@/lib/types';

const body = z.object({artworkId: z.string().uuid()});

function fail(status: number, error: string) {
  return NextResponse.json({error}, {status});
}

/**
 * Starts a Stripe Checkout for one original. The artwork is reserved first so
 * two buyers can never pay for the same piece.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return fail(503, "Online checkout isn't switched on yet. Please get in touch to buy this piece.");
  }
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(400, 'Invalid request.');
  const {artworkId} = parsed.data;

  const db = createSupabaseServiceClient();
  const {data: artwork} = await db
    .from('artworks')
    .select('id, title, price_kes, is_published')
    .eq('id', artworkId)
    .maybeSingle();
  if (!artwork?.is_published) return fail(404, 'This artwork is no longer listed.');

  const {data: order, error: orderError} = await db
    .from('orders')
    .insert({
      artwork_id: artwork.id,
      artwork_title: artwork.title,
      artwork_price_kes: artwork.price_kes,
    })
    .select('id, cancel_token')
    .single();
  if (orderError || !order) return fail(500, 'Could not start checkout. Please try again.');

  // Hold the piece slightly longer than the Stripe session lives, so it can
  // never be released while the buyer can still pay.
  const {data: reserved} = await db.rpc('reserve_artwork', {
    p_artwork_id: artwork.id,
    p_order_id: order.id,
    p_minutes: reservationMinutes + 5,
  });
  const piece = (reserved as Artwork[] | null)?.[0];
  if (!piece) {
    await db.from('orders').delete().eq('id', order.id);
    return fail(409, 'Sorry — this piece has just sold, or someone else is checking out with it.');
  }

  // Price and title as of the reservation, in case they were edited meanwhile.
  await db
    .from('orders')
    .update({artwork_title: piece.title, artwork_price_kes: piece.price_kes})
    .eq('id', order.id);

  const cover = imageUrl(piece.images[0]);
  const base = siteUrl();
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      currency,
      client_reference_id: order.id,
      metadata: {order_id: order.id, artwork_id: piece.id},
      payment_intent_data: {metadata: {order_id: order.id, artwork_id: piece.id}},
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            // Stripe amounts are in cents.
            unit_amount: piece.price_kes * 100,
            product_data: {
              name: piece.title,
              description: [piece.medium, piece.dimensions, 'Original'].filter(Boolean).join(' · '),
              images: cover?.startsWith('https://') ? [cover] : undefined,
            },
          },
        },
      ],
      shipping_address_collection: {allowed_countries: ['KE']},
      shipping_options: deliveryOptions.map(option => ({
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: option.label,
          fixed_amount: {amount: option.feeKes * 100, currency},
          delivery_estimate: {
            minimum: {unit: 'business_day', value: option.minDays},
            maximum: {unit: 'business_day', value: option.maxDays},
          },
          metadata: {delivery_id: option.id},
        },
      })),
      phone_number_collection: {enabled: true},
      expires_at: Math.floor(Date.now() / 1000) + reservationMinutes * 60,
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancelled?order=${order.id}&token=${order.cancel_token}`,
    });

    await db.from('orders').update({stripe_session_id: session.id}).eq('id', order.id);
    return NextResponse.json({url: session.url});
  } catch (error) {
    console.error('Stripe checkout failed', error);
    await db.from('orders').update({status: 'expired'}).eq('id', order.id);
    await db.rpc('release_artwork', {p_order_id: order.id});
    return fail(502, 'Payment provider unavailable. Please try again in a moment.');
  }
}
