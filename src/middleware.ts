import {NextResponse, type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';

/**
 * Keeps the Supabase auth cookie fresh and sends signed-out visitors on
 * /admin to the login page. Whether a signed-in user is actually an admin is
 * checked in the admin layout (and enforced by row level security).
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next(); // demo mode

  let response = NextResponse.next({request});
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: cookiesToSet => {
        cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
        response = NextResponse.next({request});
        cookiesToSet.forEach(({name, value, options}) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: {user},
  } = await supabase.auth.getUser();

  const {pathname} = request.nextUrl;
  if (!user && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
