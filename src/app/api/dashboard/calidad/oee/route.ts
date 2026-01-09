import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { getEmployeeOEE } from "@/lib/queries/calidad";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const anio = searchParams.get("anio") ? parseInt(searchParams.get("anio")!) : undefined;
        const mes = searchParams.get("mes") || undefined;
        const dia = searchParams.get("dia") || undefined;
        const planta = searchParams.get("planta") || undefined;

        const filters = { anio, mes, dia, planta };

        const oeeData = await getEmployeeOEE(filters);

        return NextResponse.json({
            message: "Dashboard de Calidad - OEE Empleados",
            status: "ok",
            data: oeeData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { message: errorMessage, status: "error", timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}
