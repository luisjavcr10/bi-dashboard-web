
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getBigQueryClient } from "@/lib/bigquery";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

async function getUserByEmail(email: string) {
    const bigquery = getBigQueryClient();
    const query = `
  SELECT id, name, email, password_hash, role_id, isActive 
  FROM \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.users\` 
  WHERE email = @email 
  LIMIT 1
 `;

    const options = {
        query,
        params: { email },
    };

    try {
        const [rows] = await bigquery.query(options);
        return rows[0];
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

async function getRolePermissions(roleId: string) {
    const bigquery = getBigQueryClient();
    const query = `
  SELECT name, permissions 
  FROM \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.roles\` 
  WHERE id = @id 
  LIMIT 1
 `;

    const options = {
        query,
        params: { id: roleId },
    };

    try {
        const [rows] = await bigquery.query(options);
        const role = rows[0];
        if (!role) return { name: "UNKNOWN", permissions: [] };

        // Parse permissions JSON string if necessary or cast if already object
        // BQ JSON type comes as object/array usually, but let's be safe
        return {
            name: role.name,
            permissions: Array.isArray(role.permissions) ? role.permissions : JSON.parse(role.permissions || "[]")
        };
    } catch (error) {
        console.error("Error fetching role:", error);
        return { name: "UNKNOWN", permissions: [] };
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await getUserByEmail(email);
                console.log(`[Auth Debug] Attempting login for: ${email}`);
                console.log(`[Auth Debug] User found in DB: ${!!user}`);

                if (!user) {
                    console.log("[Auth Debug] User not found");
                    return null; // User not found
                }

                if (!user.isActive) {
                    console.log("[Auth Debug] User is inactive");
                    throw new Error("Usuario inactivo");
                }

                const passwordsMatch = await bcrypt.compare(password, user.password_hash);
                console.log(`[Auth Debug] Password match: ${passwordsMatch}`);

                if (!passwordsMatch) {
                    console.log("[Auth Debug] Password mismatch");
                    return null;
                }

                // Get Role info
                const role = await getRolePermissions(user.role_id);

                // Return user object for session
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: role.name,
                    permissions: role.permissions,
                };
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
});
