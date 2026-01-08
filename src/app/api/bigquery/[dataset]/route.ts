import { NextRequest, NextResponse } from "next/server";
import { getTables, getTableSchema, getTablePreview } from "@/lib/bigquery";
import type { ApiResponse } from "@/types";

interface RouteParams {
    params: Promise<{ dataset: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { dataset } = await params;
        const { searchParams } = new URL(request.url);
        const table = searchParams.get("table");
        const action = searchParams.get("action");

        if (table && action === "schema") {
            const schema = await getTableSchema(dataset, table);
            const response: ApiResponse = {
                message: "Table schema retrieved",
                status: "ok",
                data: { schema },
                timestamp: new Date().toISOString(),
            };
            return NextResponse.json(response);
        }

        if (table && action === "preview") {
            const limit = parseInt(searchParams.get("limit") || "100");
            const rows = await getTablePreview(dataset, table, limit);
            const response: ApiResponse = {
                message: `Preview of ${table}`,
                status: "ok",
                data: { rows, count: rows.length },
                timestamp: new Date().toISOString(),
            };
            return NextResponse.json(response);
        }

        const tables = await getTables(dataset);
        const response: ApiResponse<{ tables: string[] }> = {
            message: `Tables in dataset ${dataset}`,
            status: "ok",
            data: { tables },
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        const response: ApiResponse = {
            message: `Error: ${errorMessage}`,
            status: "error",
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, { status: 500 });
    }
}
