import { runQuery } from "@/lib/bigquery";

const PROJECT = process.env.BIGQUERY_PROJECT_ID || "ageless-runway-483614-u8";
const DATASET = "procesadora_dm";

function table(name: string) {
  return `\`${PROJECT}.${DATASET}.${name}\``;
}

export interface ParadasResumen {
  totalParadas: number;
  totalDuracionMinutos: number;
  totalDuracionTurno: number;
  disponibilidadPorcentaje: number;
  mtbf: number;
  mttr: number;
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

interface Filters {
  anio?: number;
  mes?: string;
  dia?: string;
  planta?: string;
  turno?: string;
}

function buildWhereClause(filters?: Filters) {
  let whereClause = "WHERE 1=1";
  const params: Record<string, string | number> = {};

  if (filters?.anio) {
    whereClause += " AND t.Anio = @anio";
    params.anio = filters.anio;
  }
  if (filters?.mes) {
    whereClause += " AND LOWER(t.Mes) = LOWER(@mes)";
    params.mes = filters.mes;
  }
  if (filters?.dia) {
    whereClause += " AND LOWER(t.Dia) = LOWER(@dia)";
    params.dia = filters.dia;
  }
  if (filters?.planta) {
    whereClause += " AND LOWER(o.Planta) = LOWER(@planta)";
    params.planta = filters.planta;
  }
  if (filters?.turno) {
    whereClause += " AND LOWER(tu.Turno) = LOWER(@turno)";
    params.turno = filters.turno;
  }

  return { whereClause, params };
}

export async function getParadasResumen(filters?: Filters): Promise<ParadasResumen> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      COALESCE(SUM(h.NumeroParadas), 0) as totalParadas,
      COALESCE(SUM(h.TotalDuracionParada), 0) as totalDuracionMinutos,
      COALESCE(SUM(h.DuracionTurno), 0) as totalDuracionTurno,
      CASE 
        WHEN SUM(h.DuracionTurno) > 0 
        THEN ROUND((SUM(h.DuracionTurno) - SUM(h.TotalDuracionParada)) / SUM(h.DuracionTurno) * 100, 2)
        ELSE 100 
      END as disponibilidadPorcentaje,
      -- MTBF = (Total Duration - Downtime) / Number of Stops / 60 (to hours)
      CASE
        WHEN SUM(h.NumeroParadas) > 0
        THEN ROUND(((SUM(h.DuracionTurno) - SUM(h.TotalDuracionParada)) / SUM(h.NumeroParadas)) / 60, 2)
        ELSE 0
      END as mtbf,
      -- MTTR = (Total Downtime / Number of Stops) / 60 (to hours)
      CASE
        WHEN SUM(h.NumeroParadas) > 0
        THEN ROUND((SUM(h.TotalDuracionParada) / SUM(h.NumeroParadas)) / 60, 2)
        ELSE 0
      END as mttr
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
    ${whereClause}
  `;

  const rows = await runQuery<ParadasResumen>(query, params);
  return rows[0] || {
    totalParadas: 0,
    totalDuracionMinutos: 0,
    totalDuracionTurno: 0,
    disponibilidadPorcentaje: 100,
    mtbf: 0,
    mttr: 0,
  };
}

export async function getParadasPorCausa(filters?: Filters): Promise<ParadasPorCausa[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    WITH totales AS (
      SELECT SUM(TotalDuracionParada) as total_duracion
      FROM ${table("HechoParadas")} h
      JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
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
    JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY c.Causa
    ORDER BY DuracionTotal DESC
  `;

  return runQuery<ParadasPorCausa>(query, params);
}

export async function getTendenciaParadas(filters?: Filters): Promise<TendenciaParadas[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      t.Mes,
      t.Anio,
      SUM(h.NumeroParadas) as NumeroParadas,
      SUM(h.TotalDuracionParada) as DuracionTotal
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY t.Mes, t.Anio
    ORDER BY t.Anio, t.Mes
  `;

  return runQuery<TendenciaParadas>(query, params);
}

export async function getParadasPorEtapa(filters?: Filters): Promise<ParadasPorEtapa[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      p.Etapa,
      p.Tipo,
      SUM(h.NumeroParadas) as NumeroParadas,
      SUM(h.TotalDuracionParada) as DuracionTotal
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimProduccion")} p ON h.ProduccionKey = p.ProduccionKey
    JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY p.Etapa, p.Tipo
    ORDER BY DuracionTotal DESC
  `;

  return runQuery<ParadasPorEtapa>(query, params);
}

export async function getParadasPorTurno(filters?: Filters): Promise<ParadasPorTurno[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      tu.Turno,
      SUM(h.NumeroParadas) as NumeroParadas,
      SUM(h.TotalDuracionParada) as DuracionTotal,
      ROUND((SUM(h.DuracionTurno) - SUM(h.TotalDuracionParada)) / NULLIF(SUM(h.DuracionTurno), 0) * 100, 2) as Disponibilidad
    FROM ${table("HechoParadas")} h
    JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY tu.Turno
    ORDER BY Disponibilidad DESC
  `;

  return runQuery<ParadasPorTurno>(query, params);
}
