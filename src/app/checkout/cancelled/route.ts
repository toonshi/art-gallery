import {NextResponse, type NextRequest} from 'next/server';
import {isStripeConfigured, isSupabaseConfigured} from '@/lib/env';
import {markOrderExpired} from '@/lib/orders/fulfil';
import {getStripe} from '@/lib/stripe';
import {createSupabaseServiceClient} from '@/lib/supabase/server';

/**
 * Stripe sends buyers here when they leave checkout. Releasing the piece right
 * away (instead of waiting for the session to time out) lets others buy it.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order');
  const token = request.nextUrl.searchParams.get('token');
  let destination = '/artworks';

  if (orderId && token && isSupabaseConfigured() && isStripeConfigured()) {
    const db = createSupabaseServiceClient();
    const {data: order} = await db
      .from('orders')
      .select('id, status, stripe_session_id, artwork_id')
      .eq('id', orderId)
      .eq('cancel_token', token)
      .maybeSingle();

    if (order) {
      const {data: artwork} = await db
        .from('artworks')
        .select('slug')
        .eq('id', order.artwork_id)
        .maybeSingle();
      if (artwork) destination = `/artworks/${artwork.slug}?cancelled=1`;
      if (order.status === 'pending' && order.stripe_session_id) {
        // Only release the piece if Stripe agrees the buyer did not pay.
        const stripe = getStripe();
        let session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        if (session.status === 'open') {
          session = await stripe.checkout.sessions.expire(session.id).catch(() => session);
        }
        if (session.status === 'expired') await markOrderExpired(order.id);
      }
    }
  }
  return NextResponse.redirect(new URL(destination, request.nextUrl.origin), 303);
}
