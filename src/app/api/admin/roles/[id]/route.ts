
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBigQueryClient } from "@/lib/bigquery";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bigquery = getBigQueryClient();
        const query = `
   DELETE FROM \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.roles\`
   WHERE id = @id
  `;

        const options = {
            query,
            params: { id: params.id },
        };

        await bigquery.query(options);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting role:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, permissions } = body;

        const bigquery = getBigQueryClient();
        const query = `
   UPDATE \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.roles\`
   SET name = @name, description = @description, permissions = PARSE_JSON(@permissions)
   WHERE id = @id
  `;

        const options = {
            query,
            params: {
                id: params.id,
                name,
                description,
                permissions: JSON.stringify(permissions || []),
            },
        };

        await bigquery.query(options);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating role:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
