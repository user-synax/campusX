import { NextResponse } from "next/server";

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

export default async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow Better Auth API routes to pass through
    if (pathname.startsWith("/api/auth")) {
        const response = NextResponse.next();
        addSecurityHeaders(response, false);
        return response;
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
    if (includeCSP) {
        const cspHeader =
            process.env.NODE_ENV === "production"
                ? getProductionCSP()
                : getDevelopmentCSP();
        response.headers.set("Content-Security-Policy", cspHeader);
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

function getProductionCSP() {
    return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com blob:",
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

function getDevelopmentCSP() {
    return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com http://localhost:* ws://localhost:*",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tldraw.com https://*.tldraw.com blob: http://localhost:*",
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
