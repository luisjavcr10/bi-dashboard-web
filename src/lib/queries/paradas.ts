import { runQuery } from "@/lib/bigquery";

const PROJECT = process.env.BIGQUERY_PROJECT_ID || "ageless-runway-483614-u8";
const DATASET = "PROCESADORA_DM";

function table(name: string) {
    return `\`${PROJECT}.${DATASET}.${name}\``;
}

export interface ParadasResumen {
    totalParadas: number;
    totalDuracionMinutos: number;
    totalDuracionTurno: number;
    disponibilidadPorcentaje: number;
}

export interface ParadasPorCausa {
    Causa: string;
    NumeroParadas: number;
    DuracionTotal: number;
    PorcentajeDelTotal: number;
}

export interface TendenciaParadas {
    Mes: string;
    Anio: number;
    NumeroParadas: number;
    DuracionTotal: number;
}

export interface ParadasPorEtapa {
    Etapa: string;
    Tipo: string;
    NumeroParadas: number;
    DuracionTotal: number;
}

export interface ParadasPorTurno {
    Turno: string;
    NumeroParadas: number;
    DuracionTotal: number;
    Disponibilidad: number;
}

export async function getParadasResumen(filters?: {
    anio?: number;
    mes?: string;
    planta?: string;
}): Promise<ParadasResumen> {
    let whereClause = "WHERE 1=1";

    if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
    if (filters?.mes) whereClause += ` AND t.Mes = '${filters.mes}'`;
    if (filters?.planta) whereClause += ` AND o.Planta = '${filters.planta}'`;

    const query = `
    SELECT 
      COALESCE(SUM(h.NumeroParadas), 0) as totalParadas,
      COALESCE(SUM(h.TotalDuracionParada), 0) as totalDuracionMinutos,
      COALESCE(SUM(h.DuracionTurno), 0) as totalDuracionTurno,
      CASE 
        WHEN SUM(h.DuracionTurno) > 0 
        THEN ROUND((SUM(h.DuracionTurno) - SUM(h.TotalDuracionParada)) / SUM(h.DuracionTurno) * 100, 2)
        ELSE 100 
      END as disponibilidadPorcentaje
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
  `;

    const rows = await runQuery<ParadasResumen>(query);
    return rows[0] || {
        totalParadas: 0,
        totalDuracionMinutos: 0,
        totalDuracionTurno: 0,
        disponibilidadPorcentaje: 100,
    };
}

export async function getParadasPorCausa(filters?: {
    anio?: number;
    planta?: string;
}): Promise<ParadasPorCausa[]> {
    let whereClause = "WHERE 1=1";

    if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
    if (filters?.planta) whereClause += ` AND o.Planta = '${filters.planta}'`;

    const query = `
    WITH totales AS (
      SELECT SUM(TotalDuracionParada) as total_duracion
      FROM ${table("HechoParadas")} h
      JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
      JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
      ${whereClause}
    )
    SELECT 
      c.Causa,
      SUM(h.NumeroParadas) as NumeroParadas,
      SUM(h.TotalDuracionParada) as DuracionTotal,
      ROUND(SUM(h.TotalDuracionParada) / NULLIF((SELECT total_duracion FROM totales), 0) * 100, 2) as PorcentajeDelTotal
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimCausaParada")} c ON h.CausaKey = c.CausaKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY c.Causa
    ORDER BY DuracionTotal DESC
  `;

    return runQuery<ParadasPorCausa>(query);
}

export async function getTendenciaParadas(filters?: {
    anio?: number;
}): Promise<TendenciaParadas[]> {
    let whereClause = "WHERE 1=1";

    if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;

    const query = `
    SELECT 
      t.Mes,
      t.Anio,
      SUM(h.NumeroParadas) as NumeroParadas,
      SUM(h.TotalDuracionParada) as DuracionTotal
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY t.Mes, t.Anio
    ORDER BY t.Anio, t.Mes
  `;

    return runQuery<TendenciaParadas>(query);
}

export async function getParadasPorEtapa(filters?: {
    anio?: number;
}): Promise<ParadasPorEtapa[]> {
    let whereClause = "WHERE 1=1";

    if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;

    const query = `
    SELECT 
      p.Etapa,
      p.Tipo,
      SUM(h.NumeroParadas) as NumeroParadas,
      SUM(h.TotalDuracionParada) as DuracionTotal
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimProduccion")} p ON h.ProduccionKey = p.ProduccionKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY p.Etapa, p.Tipo
    ORDER BY DuracionTotal DESC
  `;

    return runQuery<ParadasPorEtapa>(query);
}

export async function getParadasPorTurno(filters?: {
    anio?: number;
}): Promise<ParadasPorTurno[]> {
    let whereClause = "WHERE 1=1";

    if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;

    const query = `
    SELECT 
      tu.Turno,
      SUM(h.NumeroParadas) as NumeroParadas,
      SUM(h.TotalDuracionParada) as DuracionTotal,
      ROUND((SUM(h.DuracionTurno) - SUM(h.TotalDuracionParada)) / NULLIF(SUM(h.DuracionTurno), 0) * 100, 2) as Disponibilidad
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY tu.Turno
    ORDER BY Disponibilidad DESC
  `;

    return runQuery<ParadasPorTurno>(query);
}
