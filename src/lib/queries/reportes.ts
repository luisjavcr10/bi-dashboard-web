import { runQuery } from "@/lib/bigquery";

const PROJECT = process.env.BIGQUERY_PROJECT_ID || "procesadora-dm";
const DATASET = "procesadora_dm";

function table(name: string) {
    return `\`${PROJECT}.${DATASET}.${name}\``;
}

// Interfaces
export interface ReporteMTTR {
    Fecha: string;
    Planta: string;
    Turno: string;
    Causa: string;
    TotalMinParada: number;
    NParadas: number;
    MTTR_Min: number | null;
}

export interface ReporteMTBF {
    Fecha: string;
    Planta: string;
    Turno: string;
    TurnoMin: number;
    ParadaMin: number;
    NParadas: number;
    MTBF_Horas: number | null;
}

export interface ReporteDisponibilidad {
    Fecha: string;
    Planta: string;
    Turno: string;
    TurnoMin: number;
    ParadaMin: number;
    Disponibilidad_Porcentaje: number | null;
}

export interface ReporteProduccionMerma {
    Fecha: string;
    Planta: string;
    Etapa: string;
    Especie: string;
    NombreMermaLean: string;
    PesoIn: number;
    PesoOut: number;
    MermaKg: number;
    TasaRendimiento: number | null;
    PorcentajeMerma: number | null;
}

export interface ReporteOEEEmpleado {
    Anio: number;
    Mes: string;
    Sucursal: string;
    Planta: string;
    Producto: string;
    Especie: string;
    Turno: string;
    Empleado: string;
    AntiguedadEmpleadoMeses: number;
    TotalUnidadesMes: number;
    DiasTrabajados: number;
    OEE_Ratio: number | null;
}

interface Filters {
    anio?: number;
    mes?: string;
    dia?: string;
    planta?: string;
}

function buildWhereClause(filters?: Filters) {
    let whereClause = "WHERE 1=1";
    const params: Record<string, string | number> = {};

    if (filters?.anio) {
        whereClause += " AND dt.Anio = @anio";
        params.anio = filters.anio;
    }
    if (filters?.mes) {
        whereClause += " AND LOWER(dt.Mes) = LOWER(@mes)";
        params.mes = filters.mes;
    }
    if (filters?.dia) {
        whereClause += " AND LOWER(dt.Dia) = LOWER(@dia)";
        params.dia = filters.dia;
    }
    if (filters?.planta) {
        whereClause += " AND LOWER(dorg.Planta) = LOWER(@planta)";
        params.planta = filters.planta;
    }

    return { whereClause, params };
}

// 1. Vista_MTTR
export async function getReporteMTTR(filters?: Filters): Promise<ReporteMTTR[]> {
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
    SELECT
      dt.Fecha,
      dorg.Planta,
      dturn.Turno,
      dcausa.Causa,
      SUM(h.TotalDuracionParada) AS TotalMinParada,
      SUM(h.NumeroParadas) AS NParadas,
      CASE 
        WHEN SUM(h.NumeroParadas) = 0 THEN NULL
        ELSE 1.0 * SUM(h.TotalDuracionParada) / SUM(h.NumeroParadas)
      END AS MTTR_Min
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTiempo")} dt        ON h.TiempoKey = dt.TiempoKey
    JOIN ${table("DimOrganizacion")} dorg ON h.OrganizacionKey = dorg.OrganizacionKey
    JOIN ${table("DimTurno")} dturn      ON h.TurnoKey = dturn.TurnoKey
    JOIN ${table("DimCausaParada")} dcausa ON h.CausaKey = dcausa.CausaKey
    ${whereClause}
    GROUP BY dt.Fecha, dorg.Planta, dturn.Turno, dcausa.Causa
    ORDER BY dt.Fecha DESC
  `;

    return runQuery<ReporteMTTR>(query, params);
}

// 2. Vista_MTBF
export async function getReporteMTBF(filters?: Filters): Promise<ReporteMTBF[]> {
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
    SELECT
      dt.Fecha,
      dorg.Planta,
      dturn.Turno,
      SUM(h.DuracionTurno) AS TurnoMin,
      SUM(h.TotalDuracionParada) AS ParadaMin,
      SUM(h.NumeroParadas) AS NParadas,
      CASE 
        WHEN SUM(h.NumeroParadas) = 0 THEN NULL
        ELSE 1.0 * (SUM(h.DuracionTurno/60.0) - SUM(h.TotalDuracionParada/60.0)) / SUM(h.NumeroParadas)
      END AS MTBF_Horas
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTiempo")} dt ON h.TiempoKey = dt.TiempoKey
    JOIN ${table("DimOrganizacion")} dorg ON h.OrganizacionKey = dorg.OrganizacionKey
    JOIN ${table("DimTurno")} dturn ON h.TurnoKey = dturn.TurnoKey
    ${whereClause}
    GROUP BY dt.Fecha, dorg.Planta, dturn.Turno
    ORDER BY dt.Fecha DESC
  `;

    return runQuery<ReporteMTBF>(query, params);
}

// 3. Vista_Disponibilidad
export async function getReporteDisponibilidad(filters?: Filters): Promise<ReporteDisponibilidad[]> {
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
    SELECT
      dt.Fecha,
      dorg.Planta,
      dturn.Turno,
      SUM(h.DuracionTurno) AS TurnoMin,
      SUM(h.TotalDuracionParada) AS ParadaMin,
      CASE 
        WHEN SUM(h.DuracionTurno) = 0 THEN NULL
        ELSE 100.0 * (SUM(h.DuracionTurno) - SUM(h.TotalDuracionParada)) / SUM(h.DuracionTurno)
      END AS Disponibilidad_Porcentaje
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTiempo")} dt ON h.TiempoKey = dt.TiempoKey
    JOIN ${table("DimOrganizacion")} dorg ON h.OrganizacionKey = dorg.OrganizacionKey
    JOIN ${table("DimTurno")} dturn ON h.TurnoKey = dturn.TurnoKey
    ${whereClause}
    GROUP BY dt.Fecha, dorg.Planta, dturn.Turno
    ORDER BY dt.Fecha DESC
  `;

    return runQuery<ReporteDisponibilidad>(query, params);
}

// 4. Vista_ProduccionMerma
export async function getReporteProduccionMerma(filters?: Filters): Promise<ReporteProduccionMerma[]> {
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
    SELECT
      dt.Fecha,
      dorg.Planta,
      dprod.Etapa,
      dproducto.Especie,
      dmerma.NombreMermaLean,
      SUM(h.PesoIngresado) AS PesoIn,
      SUM(h.PesoSalida) AS PesoOut,
      (SUM(h.PesoIngresado) - SUM(h.PesoSalida)) AS MermaKg,
      -- Tasa de Rendimiento (Yield)
      CASE 
        WHEN SUM(h.PesoIngresado) = 0 THEN NULL
        ELSE 100.0 * SUM(h.PesoSalida) / SUM(h.PesoIngresado)
      END AS TasaRendimiento,
      -- Porcentaje de Merma
      CASE 
        WHEN SUM(h.PesoIngresado) = 0 THEN NULL
        ELSE 100.0 * (SUM(h.PesoIngresado) - SUM(h.PesoSalida)) / SUM(h.PesoIngresado)
      END AS PorcentajeMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimTiempo")} dt ON h.TiempoKey = dt.TiempoKey
    JOIN ${table("DimOrganizacion")} dorg ON h.OrganizacionKey = dorg.OrganizacionKey
    JOIN ${table("DimProduccion")} dprod ON h.ProduccionKey = dprod.ProduccionKey
    JOIN ${table("DimProducto")} dproducto ON h.ProductoKey = dproducto.ProductoKey
    JOIN ${table("DimMermaLean")} dmerma ON h.MermaLeanKey = dmerma.MermaLeanKey
    ${whereClause}
    GROUP BY dt.Fecha, dorg.Planta, dprod.Etapa, dproducto.Especie, dmerma.NombreMermaLean
    ORDER BY dt.Fecha DESC
  `;

    return runQuery<ReporteProduccionMerma>(query, params);
}

// 5. Vista_OEE_Empleado
export async function getReporteOEEEmpleado(filters?: Filters): Promise<ReporteOEEEmpleado[]> {
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
    SELECT
        dt.Anio,
        dt.Mes,
        dorg.Sucursal,
        dorg.Planta,
        dprod.Producto,
        dprod.Especie,
        dturn.Turno,
        demp.NombreCompleto AS Empleado,
        (demp.AntiguedadAnios * 12) AS AntiguedadEmpleadoMeses,
        SUM(h.ProductosCorrectos) AS TotalUnidadesMes,
        COUNT(DISTINCT dt.Fecha) AS DiasTrabajados,
        (
            (MAX(dprod.tiempoIdealEmpaque) / 60.0) * SUM(h.ProductosCorrectos)
        ) 
        / 
        NULLIF(
            (
                COUNT(DISTINCT dt.Fecha) * CASE 
                    WHEN dturn.Turno LIKE '%Mañana%' THEN 600.0 
                    WHEN dturn.Turno LIKE '%Tarde%' THEN 600.0  
                    ELSE 600.0 
                END
            )
        , 0) AS OEE_Ratio

    FROM ${table("HechoCalidadEmpaque")} h
        JOIN ${table("DimTiempo")} dt ON h.TiempoKey = dt.TiempoKey
        JOIN ${table("DimOrganizacion")} dorg ON h.OrganizacionKey = dorg.OrganizacionKey
        JOIN ${table("DimTurno")} dturn ON h.TurnoKey = dturn.TurnoKey
        JOIN ${table("DimEmpleado")} demp ON h.EmpleadoKey = demp.EmpleadoKey
        JOIN ${table("DimProducto")} dprod ON h.ProductoKey = dprod.ProductoKey 
    
    ${whereClause}
    
    GROUP BY 
        dt.Anio,
        dt.Mes,
        dorg.Sucursal,
        dorg.Planta,
        dprod.Producto,
        dprod.Especie,
        dturn.Turno,
        demp.NombreCompleto,
        demp.AntiguedadAnios
    ORDER BY dt.Anio DESC, dt.Mes DESC, OEE_Ratio DESC
  `;

    return runQuery<ReporteOEEEmpleado>(query, params);
}
