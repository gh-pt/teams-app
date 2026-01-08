import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { protectedRoutes, publicRoutes } from "./routes";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // get session
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // check route types
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );


  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }


  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    // store the original URL to redirect back after login
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
