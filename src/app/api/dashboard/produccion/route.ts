import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import {
    getProduccionResumen,
    getProduccionPorEspecie,
    getMermaPorTipo,
    getTendenciaMerma,
    getTopProductosMerma,
} from "@/lib/queries/produccion";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const anio = searchParams.get("anio") ? parseInt(searchParams.get("anio")!) : undefined;
        const mes = searchParams.get("mes") || undefined;
        const dia = searchParams.get("dia") || undefined;
        const planta = searchParams.get("planta") || undefined;

        const filters = { anio, mes, dia, planta };

        const [resumen, porEspecie, mermaPorTipo, tendencia, topProductos] = await Promise.all([
            getProduccionResumen(filters),
            getProduccionPorEspecie(filters),
            getMermaPorTipo(filters),
            getTendenciaMerma(filters),
            getTopProductosMerma(10),
        ]);

        const response: ApiResponse = {
            message: "Dashboard de producción",
            status: "ok",
            data: {
                kpis: {
                    produccionTotal: Number(resumen.totalPesoSalida),
                    mermaTotal: Number(resumen.totalPesoMerma),
                    porcentajeMerma: Number(resumen.porcentajeMerma),
                    totalMallas: Number(resumen.totalMallas),
                    rendimientoPromedio: Number(resumen.rendimientoPromedio),
                },
                charts: {
                    produccionPorEspecie: porEspecie.map((p) => ({
                        name: p.Especie,
                        value: Number(p.PesoSalida),
                        merma: Number(p.PesoMerma),
                        rendimiento: Number(p.Rendimiento),
                    })),
                    mermaPorTipo: mermaPorTipo.map((m) => ({
                        name: m.NombreMermaLean,
                        value: Number(m.PesoMerma),
                    })),
                    tendenciaMerma: tendencia.map((t) => ({
                        name: t.Mes,
                        value: Number(t.PesoMerma),
                        porcentaje: Number(t.PorcentajeMerma),
                    })),
                },
                tables: {
                    topProductosMerma: topProductos.map((t) => ({
                        ...t,
                        PesoMerma: Number(t.PesoMerma),
                        PorcentajeMerma: Number(t.PorcentajeMerma),
                    })),
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
