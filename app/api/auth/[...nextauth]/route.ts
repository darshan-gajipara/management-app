/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, account }: { token: any; account?: any }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: any }) {
            (session as any).accessToken = token.accessToken;
            return session;
        },
    },
    pages: {
        signIn: '/login', // Optional: custom sign-in page
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
