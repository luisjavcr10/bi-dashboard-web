import { NextRequest, NextResponse } from "next/server";
import { getReporteOEEEmpleado } from "@/lib/queries/reportes";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filters = {
            anio: searchParams.get("anio")
                ? parseInt(searchParams.get("anio")!)
                : new Date().getFullYear(),
            mes: searchParams.get("mes") || undefined,
            dia: searchParams.get("dia") || undefined,
            planta: searchParams.get("planta") || undefined,
        };

        const data = await getReporteOEEEmpleado(filters);
        return NextResponse.json({ status: "ok", data });
    } catch (error) {
        console.error("Error fetching OEE report:", error);
        return NextResponse.json(
            { status: "error", message: "Error fetching report" },
            { status: 500 }
        );
    }
}
