import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { GenerateSecretKey } from "./lib/GenerateSecretKey";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/",
  "/about",
  "/contact",
  "/dashboard/task/taskInfo"
];

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  "/api/login",
  "/api/logout",
  "/api/test-env",
  "/api/register",
  "/api/workspaces",
];

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
];

//Only Admin Routes:
const ADMIN_ROUTES = [
  "/dashboard/reports",
  "/dashboard/task"
]

// Helper function to check if a path matches any pattern
const matchesPath = (pathname: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => {
    // Exact match
    if (pathname === pattern) return true;
    
    // Wildcard match (e.g., /dashboard matches /dashboard/*)
    if (pathname.startsWith(pattern + "/")) return true;
    
    return false;
  });
};

const AuthMiddleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Allow NextAuth internal routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = matchesPath(pathname, PUBLIC_ROUTES);
  const isPublicApiRoute = matchesPath(pathname, PUBLIC_API_ROUTES);
  const isProtectedRoute = matchesPath(pathname, PROTECTED_ROUTES);
  const isAdminRoute = matchesPath(pathname, ADMIN_ROUTES);

  // Allow public routes without authentication
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // ✅ 1. Check Bearer Token (custom JWT auth)
  const authToken =
    req.headers.get("authorization") || req.headers.get("Authorization");

  const JWT = authToken?.startsWith("Bearer")
    ? authToken.split(" ")[1]
    : authToken;

  // ✅ 2. Check NextAuth Session Cookie
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  // Check if authentication is required
  const isApiRoute = pathname.startsWith("/api");
  const requiresAuth = isProtectedRoute || isApiRoute;
  
  if (requiresAuth && !JWT && !sessionToken) {
    // Redirect to login for protected pages
    if (!isApiRoute) {
      const loginUrl = new URL("/login", req.url);
      // loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // if(isAdminRoute){
    //   const payload = await jwtVerify(sessionToken!, GenerateSecretKey());
    // }



    // Return 401 for API routes
    return NextResponse.json(
      { message: "Unauthorized, token missing" },
      { status: 401 }
    );
  }

  // If no auth required and no token, allow access
  if (!requiresAuth && !JWT && !sessionToken) {
    return NextResponse.next();
  }

  try {
    // Prefer sessionToken (cookie) over JWT (header)
    const tokenToVerify = sessionToken || JWT;

    if (tokenToVerify) {
      // Verify JWT (works for both cookie and header tokens)
      const payload = await jwtVerify(tokenToVerify, GenerateSecretKey());
      if (!payload) {
        if (!isApiRoute) {
          return NextResponse.redirect(new URL("/login", req.url));
        }
        return NextResponse.json(
          { message: "Unauthorized, invalid token" },
          { status: 401 }
        );
      }

      // Attach user data to request headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("User", JSON.stringify(payload.payload));
      if(payload.payload?.role === "Member" && isAdminRoute){
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  } catch (error: unknown) {
    console.error("Middleware error:", error);
    
    if (!isApiRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default AuthMiddleware;