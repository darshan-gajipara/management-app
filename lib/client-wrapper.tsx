"use client";

import { SessionProvider } from "next-auth/react";
// import { usePathname } from "next/navigation";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname();

  // Skip BlogProvider on /login and /register
  //   if (pathname === "/login" || pathname === "/register") {
  //     return <>{children}</>;
  //   }

  return <SessionProvider>{children}</SessionProvider>;
}
