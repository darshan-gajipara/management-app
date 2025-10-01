import { NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
];

export function withCORS(response: NextResponse) {
  const origin = response.headers.get("origin") || "";

  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]); // fallback
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}
