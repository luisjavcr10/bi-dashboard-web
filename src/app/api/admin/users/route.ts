
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBigQueryClient } from "@/lib/bigquery";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bigquery = getBigQueryClient();
        const query = `
   SELECT u.id, u.name, u.email, u.role_id, u.isActive, u.createdAt, r.name as role_name
   FROM \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.users\` u
   LEFT JOIN \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.roles\` r ON u.role_id = r.id
   ORDER BY u.createdAt DESC
  `;

        const [rows] = await bigquery.query({ query });

        return NextResponse.json({ data: rows });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, password, role_id, isActive } = body;

        if (!name || !email || !password || !role_id) {
            return NextResponse.json(
                { error: "Faltan campos requeridos" },
                { status: 400 }
            );
        }

        const bigquery = getBigQueryClient();

        // Check if email exists
        const checkQuery = `
   SELECT COUNT(*) as count 
   FROM \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.users\` 
   WHERE email = @email
  `;
        const [checkRows] = await bigquery.query({
            query: checkQuery,
            params: { email }
        });

        if (checkRows[0].count > 0) {
            return NextResponse.json(
                { error: "El correo electrónico ya existe" },
                { status: 409 }
            );
        }

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const password_hash = await bcrypt.hash(password, 10);

        const query = `
   INSERT INTO \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.users\` (id, name, email, password_hash, role_id, isActive, createdAt)
   VALUES (@id, @name, @email, @password_hash, @role_id, @isActive, @createdAt)
  `;

        const options = {
            query,
            params: {
                id,
                name,
                email,
                password_hash,
                role_id,
                isActive: isActive ?? true,
                createdAt
            }
        };

        await bigquery.query(options);

        return NextResponse.json({
            data: { id, name, email, role_id, isActive, createdAt },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
