import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { dashboardName, data } = await req.json();

        if (!data) {
            return NextResponse.json({ message: "No data provided" }, { status: 400 });
        }

        const prompt = `
      Actúa como un analista de negocios senior en una planta de procesamiento de frutas.
      
      Estás analizando el dashboard: "${dashboardName}".
      
      Aquí están los datos actuales (en formato JSON):
      ${JSON.stringify(data, null, 2)}
      
      Tu tarea:
      1. Identificar las métricas críticas que requieren atención inmediata.
      2. Detectar anomalías o tendencias preocupantes en la data.
      3. Proporcionar 3 recomendaciones ejecutivas breves y accionables para mejorar el rendimiento.
      
      Formato de respuesta:
      Usa Markdown simple. Sé directo y profesional. No saludes, ve directo al análisis.
      Usa negritas para resaltar puntos clave.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            status: "ok",
            response: text
        });

    } catch (error) {
        console.error("Agent error:", error);
        return NextResponse.json(
            { message: "Error analyzing dashboard", status: "error" },
            { status: 500 }
        );
    }
}
