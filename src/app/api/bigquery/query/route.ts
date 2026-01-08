import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/lib/bigquery";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query || typeof query !== "string") {
            const response: ApiResponse = {
                message: "Query is required",
                status: "error",
                timestamp: new Date().toISOString(),
            };
            return NextResponse.json(response, { status: 400 });
        }

        const forbiddenKeywords = ["DROP", "DELETE", "TRUNCATE", "INSERT", "UPDATE", "ALTER", "CREATE"];
        const upperQuery = query.toUpperCase();

        for (const keyword of forbiddenKeywords) {
            if (upperQuery.includes(keyword)) {
                const response: ApiResponse = {
                    message: `Forbidden operation: ${keyword} is not allowed`,
                    status: "error",
                    timestamp: new Date().toISOString(),
                };
                return NextResponse.json(response, { status: 403 });
            }
        }

        const rows = await runQuery(query);

        const response: ApiResponse = {
            message: "Query executed successfully",
            status: "ok",
            data: { rows, count: rows.length },
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        const response: ApiResponse = {
            message: `Query failed: ${errorMessage}`,
            status: "error",
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, { status: 500 });
    }
}
