# Arten — online gallery & shop

A storefront for selling one-of-a-kind original artworks, with an admin
dashboard for the artist.

- **Shop** — home page with featured works, a filterable catalogue, and a page
  per artwork (photo gallery with zoom, details, delivery options, Buy now).
- **Checkout** — Stripe Checkout in KES, with Kenyan delivery options and
  studio pickup. A piece is reserved while a buyer is paying, so an original can
  never be sold twice; abandoned checkouts free it again.
- **Admin** (`/admin`) — sales overview, add/edit artworks with photo upload,
  hide/feature pieces, and track orders from *paid* → *sent* → *delivered*.

Built with Next.js (App Router), [Astryx](https://github.com/facebook/astryx)
components, Supabase (database, login, photo storage) and Stripe.

## Try it now (demo mode)

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the shop and http://localhost:3000/admin for the
dashboard. Without Supabase keys the app runs on sample data; saving and
checkout are switched off.

## Going live

### 1. Supabase (database, login, photos)

1. Create a project at [supabase.com](https://supabase.com) (the free tier is
   plenty).
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`. It creates
   the tables, security rules and the public `artworks` photo bucket.
3. In **Authentication → Users**, click **Add user** and create the artist's
   login (email + password).
4. Make that user an admin (SQL Editor):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'artist@example.com';
   ```
5. In **Authentication → Sign In / Providers**, turn off **Allow new users to
   sign up**. Only the admins you create should be able to log in.
6. Copy the project URL, anon key and service role key into `.env.local`
   (see `.env.example`).

### 2. Stripe (payments)

> ⚠️ Stripe only onboards businesses in
> [supported countries](https://stripe.com/global), and Kenya isn't on that
> list at the time of writing. It can *charge* in KES, but the Stripe account
> must belong to a business in a supported country. If that doesn't work for
> you, the payment code lives in `src/app/api/checkout/route.ts` and
> `src/lib/orders/fulfil.ts` and can be swapped for Paystack or M-Pesa.

1. Put your secret key in `STRIPE_SECRET_KEY` (start with test mode:
   `sk_test_…`).
2. Webhook, so paid orders are recorded even if the buyer closes the tab:
   - **Locally:** `stripe listen --forward-to localhost:3000/api/stripe/webhook`
     and copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`.
   - **In production:** Stripe dashboard → Developers → Webhooks → add endpoint
     `https://your-domain/api/stripe/webhook` with the events
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed` and `checkout.session.expired`.
3. Test a purchase with card `4242 4242 4242 4242`.

Refunds are made from the Stripe dashboard. Cancelling an order in the admin
puts the piece back on sale but doesn't move any money.

### 3. Deploy

Deploy to [Vercel](https://vercel.com) (or any Node host): import the repo, add
the variables from `.env.example`, and set `NEXT_PUBLIC_SITE_URL` to the real
domain.

## Customising

- **Shop name, tagline, delivery fees:** `src/lib/config.ts`
- **Colours and fonts:** the Astryx theme in `src/themes/neutral/`
  (`npx astryx theme list` / `npx astryx docs theme`)
- **Database schema:** `supabase/migrations/`

## Scripts

| Command             | What it does                  |
| ------------------- | ----------------------------- |
| `npm run dev`       | Local dev server              |
| `npm run build`     | Production build              |
| `npm run typecheck` | TypeScript check              |
