import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import {
    getParadasResumen,
    getParadasPorCausa,
    getTendenciaParadas,
    getParadasPorEtapa,
    getParadasPorTurno,
} from "@/lib/queries/paradas";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const anio = searchParams.get("anio") ? parseInt(searchParams.get("anio")!) : undefined;
        const mes = searchParams.get("mes") || undefined;
        const planta = searchParams.get("planta") || undefined;

        const filters = { anio, mes, planta };

        const [resumen, porCausa, tendencia, porEtapa, porTurno] = await Promise.all([
            getParadasResumen(filters),
            getParadasPorCausa(filters),
            getTendenciaParadas(filters),
            getParadasPorEtapa(filters),
            getParadasPorTurno(filters),
        ]);

        const response: ApiResponse = {
            message: "Dashboard de paradas",
            status: "ok",
            data: {
                kpis: {
                    disponibilidad: resumen.disponibilidadPorcentaje,
                    totalParadas: resumen.totalParadas,
                    tiempoPerdido: resumen.totalDuracionMinutos,
                    mtbf: resumen.mtbf,
                    mttr: resumen.mttr,
                },
                charts: {
                    paradasPorCausa: porCausa.map((p) => ({
                        name: p.Causa,
                        value: p.DuracionTotal,
                        cantidad: p.NumeroParadas,
                        porcentaje: p.PorcentajeDelTotal,
                    })),
                    tendenciaParadas: tendencia.map((t) => ({
                        name: t.Mes,
                        value: t.DuracionTotal,
                        cantidad: t.NumeroParadas,
                    })),
                    paradasPorEtapa: porEtapa.map((e) => ({
                        name: e.Etapa,
                        tipo: e.Tipo,
                        value: e.DuracionTotal,
                        cantidad: e.NumeroParadas,
                    })),
                    paradasPorTurno: porTurno.map((t) => ({
                        name: t.Turno,
                        value: t.DuracionTotal,
                        disponibilidad: t.Disponibilidad,
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
