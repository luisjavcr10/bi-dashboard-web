
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBigQueryClient } from "@/lib/bigquery";
import bcrypt from "bcryptjs";

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
   DELETE FROM \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.users\`
   WHERE id = @id
  `;

        const options = {
            query,
            params: { id: params.id },
        };

        await bigquery.query(options);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
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
        const { name, email, password, role_id, isActive } = body;

        const bigquery = getBigQueryClient();
        let query = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paramsQuery: any = {
            id: params.id,
            name,
            email,
            role_id,
            isActive,
        };

        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            query = `
    UPDATE \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.users\`
    SET name = @name, email = @email, password_hash = @password_hash, role_id = @role_id, isActive = @isActive
    WHERE id = @id
   `;
            paramsQuery.password_hash = password_hash;
        } else {
            query = `
    UPDATE \`${process.env.BIGQUERY_PROJECT_ID}.auth_system.users\`
    SET name = @name, email = @email, role_id = @role_id, isActive = @isActive
    WHERE id = @id
   `;
        }

        const options = {
            query,
            params: paramsQuery,
        };

        await bigquery.query(options);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
