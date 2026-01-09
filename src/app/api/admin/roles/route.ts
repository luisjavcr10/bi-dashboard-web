
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBigQueryClient } from "@/lib/bigquery";
import crypto from "crypto";

export async function GET() {
    try {
        const session = await auth();

        // Basic authorization check
        // In a real app, strict role checking (e.g., session?.user?.role === 'ADMIN') is recommended
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bigquery = getBigQueryClient();
        const query = `
   SELECT * FROM \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.roles\`
   ORDER BY createdAt DESC
  `;

        const [rows] = await bigquery.query({ query });

        // Parse permissions if stored as JSON string
        const roles = rows.map((role: { id: string; name: string; description: string; permissions: string | string[]; createdAt: string }) => ({
            ...role,
            permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions || '[]') : role.permissions
        }));

        return NextResponse.json({ data: roles });
    } catch (error) {
        console.error("Error fetching roles:", error);
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
        const { name, description, permissions } = body;

        if (!name) {
            return NextResponse.json(
                { error: "El nombre es requerido" },
                { status: 400 }
            );
        }

        const bigquery = getBigQueryClient();
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const query = `
   INSERT INTO \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.roles\` (id, name, description, permissions, createdAt)
   VALUES (@id, @name, @description, PARSE_JSON(@permissions), @createdAt)
  `;

        const options = {
            query,
            params: {
                id,
                name,
                description,
                permissions: JSON.stringify(permissions || []),
                createdAt
            }
        };

        await bigquery.query(options);

        return NextResponse.json({
            data: { id, name, description, permissions, createdAt },
        });
    } catch (error) {
        console.error("Error creating role:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
