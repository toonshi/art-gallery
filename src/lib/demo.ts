import type {Artwork, Order} from './types';

/*
 * Sample content used when Supabase is not configured yet, so the shop and
 * admin can be previewed straight after `npm run dev`. The images are
 * generated colour-field compositions standing in for real photos.
 */

function colourField(colours: string[], variant: number): string {
  const [bg, a, b, c] = colours;
  const shapes = [
    // Stacked fields, in the manner of a colour-field painting.
    `<rect x="60" y="70" width="680" height="380" rx="18" fill="${a}" opacity=".92"/>
     <rect x="60" y="490" width="680" height="440" rx="18" fill="${b}" opacity=".9"/>
     <rect x="60" y="850" width="680" height="80" rx="12" fill="${c}" opacity=".85"/>`,
    // Sun over layered horizon.
    `<circle cx="400" cy="380" r="210" fill="${a}"/>
     <path d="M0 640 C 200 560 360 700 800 600 L800 1000 L0 1000Z" fill="${b}"/>
     <path d="M0 780 C 260 700 520 860 800 760 L800 1000 L0 1000Z" fill="${c}"/>`,
    // Overlapping discs.
    `<circle cx="300" cy="420" r="230" fill="${a}" opacity=".85"/>
     <circle cx="500" cy="560" r="250" fill="${b}" opacity=".75"/>
     <circle cx="380" cy="700" r="150" fill="${c}" opacity=".8"/>`,
    // Vertical bands.
    `<rect x="80" y="80" width="180" height="840" fill="${a}"/>
     <rect x="310" y="160" width="180" height="760" fill="${b}"/>
     <rect x="540" y="240" width="180" height="680" fill="${c}"/>`,
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="${bg}"/>${shapes[variant % shapes.length]}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`;
}

const now = Date.parse('2026-09-20T10:00:00Z');
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

function artwork(
  i: number,
  fields: Pick<Artwork, 'title' | 'medium' | 'dimensions' | 'year' | 'price_kes'> &
    Partial<Artwork> & {colours: string[]},
): Artwork {
  const {colours, ...rest} = fields;
  return {
    id: `demo-${i}`,
    slug: rest.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description:
      'Built up over several weeks in thin layers, letting each colour settle before the next. Signed on the reverse and shipped with a certificate of authenticity.',
    status: 'available',
    is_published: true,
    is_featured: false,
    images: [colourField(colours, i), colourField([colours[0], colours[2], colours[3], colours[1]], i + 1)],
    reserved_until: null,
    created_at: daysAgo(i * 6),
    updated_at: daysAgo(i * 3),
    ...rest,
  };
}

export const demoArtworks: Artwork[] = [
  artwork(0, {title: 'Ngong Hills at Dusk', medium: 'Acrylic on canvas', dimensions: '90 × 120 cm', year: 2026, price_kes: 185000, is_featured: true, colours: ['#f3e7d8', '#e0703a', '#6b3f5e', '#2c2540']}),
  artwork(1, {title: 'Lamu Blue', medium: 'Oil on linen', dimensions: '60 × 80 cm', year: 2026, price_kes: 140000, is_featured: true, colours: ['#eef2f3', '#f2c14e', '#1f5f8b', '#0b2f4a']}),
  artwork(2, {title: 'Jacaranda Season', medium: 'Acrylic on canvas', dimensions: '70 × 70 cm', year: 2025, price_kes: 98000, is_featured: true, colours: ['#f6f0f7', '#8e6fc1', '#c9a3e0', '#3d2c5e']}),
  artwork(3, {title: 'Rift Valley Study I', medium: 'Mixed media on paper', dimensions: '42 × 59 cm', year: 2025, price_kes: 45000, colours: ['#f4efe6', '#b5651d', '#d9a441', '#4a3b2a']}),
  artwork(4, {title: 'Market Morning', medium: 'Oil on canvas', dimensions: '100 × 100 cm', year: 2025, price_kes: 220000, status: 'sold', colours: ['#fbf4ea', '#d1495b', '#edae49', '#00798c']}),
  artwork(5, {title: 'Tana, Low Water', medium: 'Watercolour on paper', dimensions: '30 × 40 cm', year: 2024, price_kes: 32000, colours: ['#f1f4ef', '#7a9e7e', '#b3c5a1', '#31493c']}),
  artwork(6, {title: 'Night Bus to Kisumu', medium: 'Acrylic on board', dimensions: '50 × 70 cm', year: 2024, price_kes: 76000, status: 'sold', colours: ['#1d1f2b', '#f4a259', '#5b8e7d', '#bc4b51']}),
  artwork(7, {title: 'Salt and Coral', medium: 'Oil on linen', dimensions: '80 × 100 cm', year: 2026, price_kes: 165000, is_published: false, colours: ['#fdf6f0', '#f28f79', '#f7d6c4', '#9c4f46']}),
];

function order(
  i: number,
  art: Artwork,
  fields: Partial<Order> & {status: Order['status']; customer_name: string},
): Order {
  const fee = fields.delivery_fee_kes ?? 500;
  return {
    id: `demo-order-${i}`,
    reference: `A${(4821 + i * 137).toString(16).toUpperCase()}`,
    artwork_id: art.id,
    artwork_title: art.title,
    artwork_price_kes: art.price_kes,
    delivery_method: 'Delivery within Nairobi',
    delivery_fee_kes: fee,
    total_kes: art.price_kes + fee,
    customer_email: `${fields.customer_name.split(' ')[0].toLowerCase()}@example.com`,
    customer_phone: '+254 700 000 000',
    shipping_address: {line1: '14 Riverside Drive', city: 'Nairobi', country: 'KE'},
    notes: '',
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    paid_at: daysAgo(i * 4 + 1),
    created_at: daysAgo(i * 4 + 1),
    updated_at: daysAgo(i * 4),
    ...fields,
  };
}

export const demoOrders: Order[] = [
  order(0, demoArtworks[4], {status: 'paid', customer_name: 'Wanjiru Kamau'}),
  order(1, demoArtworks[6], {status: 'delivered', customer_name: 'Daniel Otieno', delivery_method: 'Delivery elsewhere in Kenya', delivery_fee_kes: 1500, shipping_address: {line1: 'Oginga Odinga St', city: 'Kisumu', country: 'KE'}}),
  order(2, demoArtworks[1], {status: 'expired', customer_name: 'Amina Hassan', paid_at: null, delivery_method: null, delivery_fee_kes: null, total_kes: null, shipping_address: null, customer_phone: null}),
];
