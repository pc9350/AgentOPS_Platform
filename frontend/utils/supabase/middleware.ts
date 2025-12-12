import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  console.log('=== MIDDLEWARE ===')
  console.log('Path:', request.nextUrl.pathname)
  
  // Find the Supabase auth cookie
  const allCookies = request.cookies.getAll();
  const authCookie = allCookies.find(c => c.name.includes('-auth-token'));
  
  let isAuthenticated = false;
  
  if (authCookie) {
    try {
      // Parse the session from the cookie
      const session = JSON.parse(authCookie.value);
      
      // Check if we have a valid access token and it's not expired
      if (session.access_token && session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        isAuthenticated = session.expires_at > now;
        console.log('Session found, expires_at:', session.expires_at, 'now:', now, 'valid:', isAuthenticated);
      }
    } catch (e) {
      console.log('Failed to parse auth cookie:', e);
    }
  } else {
    console.log('No auth cookie found');
  }

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");
  
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");

  if (isAuthCallback) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !isAuthPage) {
    console.log('Not authenticated, redirecting to login');
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && isAuthPage) {
    console.log('Authenticated, redirecting to home');
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
};
