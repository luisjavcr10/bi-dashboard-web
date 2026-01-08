import { NextResponse } from "next/server";
import { getDatasets } from "@/lib/bigquery";
import type { ApiResponse } from "@/types";

export async function GET() {
    try {
        const datasets = await getDatasets();

        const response: ApiResponse<{ datasets: string[] }> = {
            message: "BigQuery connection successful",
            status: "ok",
            data: { datasets },
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        const response: ApiResponse = {
            message: `BigQuery connection failed: ${errorMessage}`,
            status: "error",
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, { status: 500 });
    }
}
