import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

export const dynamic = 'force-dynamic';

// specialized system prompts...
const DASHBOARD_PROMPTS: Record<string, string> = {
    "Paradas": `Actúa como un Ingeniero de Confiabilidad y Mantenimiento Senior.
    Tu objetivo es maximizar la disponibilidad de la planta y reducir los tiempos muertos.
    
    ESTÁNDARES DE KPI (Úsalos para evaluar el estado):
    1. MTBF (Tiempo Medio Entre Fallas):
       - 🔴 CRÍTICO: < 6 horas
       - 🟡 ALERTA: 6 - 10 horas
       - 🟢 BUENO: > 10 horas
    
    2. MTTR (Tiempo Medio de Reparación):
       - 🔴 CRÍTICO: > 60 minutos
       - 🟡 ALERTA: 30 - 60 minutos
       - 🟢 BUENO: < 30 minutos
       
    3. DISPONIBILIDAD:
       - 🔴 CRÍTICO: < 75%
       - 🟡 ALERTA: 75% - 90%
       - 🟢 BUENO: > 90%
    
    Analiza:
    - Compara los valores actuales con los estándares anteriores.
    - Causas raíces más frecuentes de las paradas.
    - Tendencias de fallas.
    
    Proporciona 3 recomendaciones técnicas enfocadas en alcanzar los niveles "BUENO".`,

    "Producción": `Actúa como un Gerente de Planta enfocado en Eficiencia Operativa.
    Tu objetivo es maximizar el rendimiento (yield) y minimizar la merma.
    
    ESTÁNDARES DE KPI (Úsalos para evaluar el estado):
    1. TASA DE RENDIMIENTO (Yield) por Producto:
       - 🔴 CRÍTICO: < 30%
       - 🟡 ALERTA: 30% - 50%
       - 🟢 BUENO: > 50%
    
    Analiza:
    - Evalúa el rendimiento de cada especie/producto contra el estándar.
    - Identifica tipos de merma que más afectan el rendimiento.
    
    Proporciona 3 acciones operativas para llevar el rendimiento a niveles óptimos (>50%).`,

    "Calidad": `Actúa como un Gerente de Calidad y Mejora Continua.
    Tu objetivo es asegurar la excelencia del producto y la eficiencia del personal.
    
    ESTÁNDARES DE KPI (Úsalos para evaluar el estado):
    1. OEE (Rendimiento Productivo) de Empleados:
       - 🔴 CRÍTICO: < 60%
       - 🟡 ALERTA: 60% - 85%
       - 🟢 BUENO: ≥ 85%
    
    Analiza:
    - Clasifica a los empleados según su OEE usando los rangos anteriores.
    - Tasa de productos correctos vs. defectuosos.
    
    Proporciona 3 estrategias para mejorar el OEE del personal hacia la zona "BUENO" (≥85%).`
};

const DEFAULT_PROMPT = `Actúa como un analista de negocios senior en una planta de procesamiento.
  Identifica métricas críticas, anomalías y ofrece 3 recomendaciones generales de mejora.`;

export async function POST(req: NextRequest) {
    try {
        const { dashboardName, data } = await req.json();

        if (!data) {
            return NextResponse.json({ message: "No data provided" }, { status: 400 });
        }

        // Select specific prompt or fallback
        const specificContext = DASHBOARD_PROMPTS[dashboardName] || DEFAULT_PROMPT;

        const prompt = `
      ${specificContext}
      
      Estás analizando el dashboard: "${dashboardName}".
      
      Aquí están los datos actuales (en formato JSON):
      ${JSON.stringify(data, null, 2)}
      
      Tu respuesta debe ser:
      1. Breve y directa (sin saludos).
      2. Usar Markdown para resaltar hallazgos (negritas, listas).
      3. Estrictamente basada en los datos proporcionados.
    `;

        const model = getModel();
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
