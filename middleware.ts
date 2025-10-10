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

// Only Admin Routes
const ADMIN_ROUTES = [
  "/dashboard/reports",
  "/dashboard/task",
];

// Helper function to check if a path matches any pattern
const matchesPath = (pathname: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => {
    if (pathname === pattern) return true;
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

  // ✅ 1️⃣ Check for existing token BEFORE handling public routes
  const authToken =
    req.headers.get("authorization") || req.headers.get("Authorization");

  const JWT = authToken?.startsWith("Bearer")
    ? authToken.split(" ")[1]
    : authToken;

  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const tokenToVerify = sessionToken || JWT;

  // ✅ Redirect logged-in users away from /login or /register
  if (tokenToVerify && (pathname === "/login" || pathname === "/register")) {
    try {
      await jwtVerify(tokenToVerify, GenerateSecretKey());
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // Invalid token → allow access to login/register
    }
  }

  // ✅ 2️⃣ Identify route type
  const isPublicRoute = matchesPath(pathname, PUBLIC_ROUTES);
  const isPublicApiRoute = matchesPath(pathname, PUBLIC_API_ROUTES);
  const isProtectedRoute = matchesPath(pathname, PROTECTED_ROUTES);
  const isAdminRoute = matchesPath(pathname, ADMIN_ROUTES);

  // Allow public routes (except the handled /login, /register above)
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api");
  const requiresAuth = isProtectedRoute || isApiRoute;

  // ✅ 3️⃣ Block access if no valid token
  if (requiresAuth && !tokenToVerify) {
    if (!isApiRoute) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      { message: "Unauthorized, token missing" },
      { status: 401 }
    );
  }

  // ✅ 4️⃣ Verify token if present
  try {
    if (tokenToVerify) {
      const { payload } = await jwtVerify(tokenToVerify, GenerateSecretKey());

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
      requestHeaders.set("User", JSON.stringify(payload));

      // ✅ Restrict member from accessing admin routes
      if (payload.role === "Member" && isAdminRoute) {
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

  // Default allow
  return NextResponse.next();
};

// ✅ Middleware matcher
export const config = {
  matcher: [
    // Match all paths except static assets and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default AuthMiddleware;
