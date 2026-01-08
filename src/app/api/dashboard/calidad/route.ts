import { NextRequest, NextResponse } from "next/server";
import {
    getCalidadResumen,
    getCalidadPorTurno,
    getCalidadPorProducto,
    getTopEmpleados,
    getRendimientoPorAntiguedad,
} from "@/lib/queries/calidad";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const anio = searchParams.get("anio") ? parseInt(searchParams.get("anio")!) : undefined;
        const mes = searchParams.get("mes") || undefined;
        const planta = searchParams.get("planta") || undefined;

        const filters = { anio, mes, planta };

        const [resumen, porTurno, porProducto, topEmpleados, porAntiguedad] = await Promise.all([
            getCalidadResumen(filters),
            getCalidadPorTurno(filters),
            getCalidadPorProducto(filters),
            getTopEmpleados(10, filters),
            getRendimientoPorAntiguedad(filters),
        ]);

        const response: ApiResponse = {
            message: "Dashboard de calidad",
            status: "ok",
            data: {
                kpis: {
                    productosCorrectos: resumen.totalProductosCorrectos,
                    totalProcesos: resumen.totalProcesos,
                },
                charts: {
                    calidadPorTurno: porTurno.map((t) => ({
                        name: t.Turno,
                        value: t.ProductosCorrectos,
                        procesos: t.TotalProcesos,
                    })),
                    calidadPorProducto: porProducto.slice(0, 10).map((p) => ({
                        name: p.Producto,
                        especie: p.Especie,
                        value: p.ProductosCorrectos,
                    })),
                    rendimientoPorAntiguedad: porAntiguedad.map((r) => ({
                        name: r.RangoAntiguedad,
                        value: r.PromedioProductos,
                        empleados: r.TotalEmpleados,
                    })),
                },
                tables: {
                    topEmpleados: topEmpleados,
                },
            },
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { message: errorMessage, status: "error", timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}
