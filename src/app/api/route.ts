import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import connectDB from "@/lib/mongodb";

export async function GET() {
    try {
        await connectDB();

        const response: ApiResponse = {
            message: "API is running",
            status: "ok",
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch {
        const response: ApiResponse = {
            message: "Database connection failed",
            status: "error",
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, { status: 500 });
    }
}
