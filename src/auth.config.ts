
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/sign-in",
    },
    callbacks: {
        authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const nextUrl = request.nextUrl;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnSignIn = nextUrl.pathname === "/sign-in";

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isOnSignIn) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard/produccion", nextUrl));
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user }: { token: Record<string, unknown>; user: unknown }) {
            if (user) {
                const u = user as { role?: string; permissions?: string[]; id?: string };
                token.role = u.role;
                token.permissions = u.permissions;
                token.id = u.id;
            }
            return token;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user.role = token.role;
                session.user.permissions = token.permissions;
                session.user.id = token.id;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
