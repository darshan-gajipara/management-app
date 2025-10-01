import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { GenerateSecretKey } from "./lib/GenerateSecretKey";

const AuthMiddleware = async (req: NextRequest) => {
  const ignoredPaths = ["/api/login", "/api/test-env", "/api/register"];
  if (
    ignoredPaths.includes(req.nextUrl.pathname) ||
    req.nextUrl.pathname.startsWith("/api/auth")
  ) {
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

  if (!JWT && !sessionToken) {
    return NextResponse.json(
      { message: "Unauthorized, token missing" },
      { status: 401 }
    );
  }

  try {
    if (JWT) {
      // Verify your custom JWT
      const payload = await jwtVerify(JWT, GenerateSecretKey());
      if (!payload) {
        return NextResponse.json(
          { message: "Unauthorized, invalid token" },
          { status: 401 }
        );
      }

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("User", JSON.stringify(payload.payload));

      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (sessionToken) {
      // ✅ Just trust NextAuth cookies (next-auth handles verification internally)
      return NextResponse.next();
    }
  } catch (error: unknown) {
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const config = {
  matcher: ["/api/:path*"], // ✅ Apply only to /api routes
};

export default AuthMiddleware;
