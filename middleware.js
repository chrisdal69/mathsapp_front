import { NextResponse } from "next/server";
const NODE_ENV = process.env.NODE_ENV;
const URL_BACK = process.env.NEXT_PUBLIC_URL_BACK;
const urlFetch = NODE_ENV === "production" ? URL_BACK : "http://localhost:3000";


export async function middleware(req) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  const cookie = req.cookies.get("jwt")?.value;
  if (!cookie) return NextResponse.redirect(new URL("/", req.url));

  const resp = await fetch(`${urlFetch}/auth/me`, {
    headers: { cookie: req.headers.get("cookie") ?? `jwt=${cookie}` },
  });
  if (!resp.ok) return NextResponse.redirect(new URL("/", req.url));

  const data = await resp.json();
  if (data.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
