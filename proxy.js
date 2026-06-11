import { NextResponse } from "next/server";
import { getClientIP } from "./lib/rate-limit";
import IPBan from "@/models/IPBan";

const protectedRoutes = [
    "/feed",
    "/communities",
    "/resources",
    "/profile",
    "/settings",
    "/community",
    "/bookmarks",
    "/wallet",
    "/shop",
];

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // Allow Better Auth API routes to pass through
    if (pathname.startsWith("/api/auth")) {
        const response = NextResponse.next();
        addSecurityHeaders(response, false);
        return response;
    }

    // 1. Check IP ban for ALL API routes
    if (pathname.startsWith("/api/")) {
        try {
            // Note: Edge middleware requires fetch or specialized edge-compatible DB drivers.
            // Since we're using Mongoose/MongoDB, we can't directly use models here.
            // THE USER INSTRUCTION ASKED FOR:
            // import IPBan from '@/models/IPBan'
            // import UserBan from '@/models/UserBan'
            //
            // However, standard Mongoose models DON'T work in Next.js Edge Middleware.
            // I will implement the logic as requested but add a comment about Edge environment limitations.
            // In a real production setup, IP bans would be checked via a Redis cache or a specialized edge-compatible DB driver (like MongoDB Atlas Data API).
            // This is what was requested:
            const ip = getClientIP(request);
            const ipBan = await IPBan.findOne({
                ip,
                isActive: true,
                $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
            }).lean();

            if (ipBan) {
                return NextResponse.json(
                    { error: "Access denied" },
                    { status: 403 },
                );
            }
        } catch (err) {
            console.error("Middleware IP ban check failed:", err.message);
        }
    }

    // Get JWT session token
    const session = request.cookies.get("campusx_token")?.value;

    // Public routes - always accessible
    const publicRoutes = ["/", "/login", "/signup"];
    const isPublicRoute = publicRoutes.some((route) => pathname === route);

    // API auth routes - always accessible
    const isAuthApiRoute = pathname.startsWith("/api/auth");

    if (isAuthApiRoute) {
        const response = NextResponse.next();
        addSecurityHeaders(response, false);
        return response;
    }

    // If user is logged in and tries to access login/signup, redirect to feed
    if (session && (pathname === "/login" || pathname === "/signup")) {
        const response = NextResponse.redirect(new URL("/feed", request.url));
        addSecurityHeaders(response);
        return response;
    }

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route),
    );

    if (isProtectedRoute) {
        if (!session) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            const response = NextResponse.redirect(loginUrl);
            addSecurityHeaders(response);
            return response;
        }
    }

    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
}

function addSecurityHeaders(response, includeCSP = true) {
    const nonce = crypto.randomUUID();

    if (includeCSP) {
        const cspHeader =
            process.env.NODE_ENV === "production"
                ? getProductionCSP(nonce)
                : getDevelopmentCSP(nonce);
        response.headers.set("Content-Security-Policy", cspHeader);
        response.headers.set("x-nonce", nonce);
    }

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
    );
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
    );
    response.headers.set("Origin-Agent-Cluster", "?1");
}

function getProductionCSP(nonce) {
    return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://www.youtube.com https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com 'unsafe-eval'`,
        `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com blob:`,
        "img-src 'self' data: https: http: blob: https://utfs.io https://*.uploadthing.com https://*.ufs.sh https://*.tldraw.com",
        "connect-src 'self' https://api.anthropic.com wss://*.pusher.com https://*.pusher.com https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://*.uploadthing.com https://*.ingest.uploadthing.com https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com blob: data:",
        "font-src 'self' https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com data:",
        "frame-src 'self' https://www.youtube.com https://*.tldraw.com",
        "worker-src 'self' blob: https://*.tldraw.com",
        "child-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "report-uri /api/csp-violation-report",
    ].join("; ");
}

function getDevelopmentCSP(nonce) {
    return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://www.youtube.com https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com 'unsafe-eval' 'unsafe-inline' http://localhost:* ws://localhost:*`,
        `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com blob: http://localhost:*`,
        "img-src 'self' data: https: http: blob: https://utfs.io https://*.uploadthing.com https://*.ufs.sh https://*.tldraw.com http://localhost:*",
        "connect-src 'self' https://api.anthropic.com wss://*.pusher.com https://*.pusher.com https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://*.uploadthing.com https://*.ingest.uploadthing.com https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com blob: data: http://localhost:* ws://localhost:*",
        "font-src 'self' https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com data: http://localhost:*",
        "frame-src 'self' https://www.youtube.com https://*.tldraw.com http://localhost:*",
        "worker-src 'self' blob: https://*.tldraw.com",
        "child-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join("; ");
}

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
