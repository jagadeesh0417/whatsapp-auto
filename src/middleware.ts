import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config/env";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/reset-password") || pathname.startsWith("/api/auth");
  const isPublic = pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/public");

  if (isPublic) return NextResponse.next();

  // Check for session cookie
  const hasSupabaseSession = req.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  const hasDemoSession = req.cookies.get("akradhi_session")?.value;
  const authed = isSupabaseConfigured ? hasSupabaseSession : Boolean(hasDemoSession);

  if (!isAuthRoute && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (isAuthRoute && authed && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
