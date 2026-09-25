import 'server-only';
import Stripe from 'stripe';
import {requireEnv} from './env';

let client: Stripe | null = null;

export function getStripe(): Stripe {
  client ??= new Stripe(requireEnv('STRIPE_SECRET_KEY'));
  return client;
}
