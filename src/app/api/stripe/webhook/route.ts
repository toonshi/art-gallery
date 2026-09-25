import {NextResponse} from 'next/server';
import type Stripe from 'stripe';
import {requireEnv} from '@/lib/env';
import {getStripe} from '@/lib/stripe';
import {markOrderExpired, markOrderPaid} from '@/lib/orders/fulfil';

/**
 * Stripe → shop. Subscribe these events in the Stripe dashboard:
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired.
 */
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({error: 'Missing signature'}, {status: 400});

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      requireEnv('STRIPE_WEBHOOK_SECRET'),
    );
  } catch (error) {
    console.error('Stripe webhook signature check failed', error);
    return NextResponse.json({error: 'Invalid signature'}, {status: 400});
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await markOrderPaid(event.data.object.id);
      break;
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) await markOrderExpired(orderId);
      break;
    }
  }
  return NextResponse.json({received: true});
}
