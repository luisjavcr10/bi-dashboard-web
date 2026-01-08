import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export async function GET() {
    const response: ApiResponse = {
        message: "API is running",
        status: "ok",
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
}
