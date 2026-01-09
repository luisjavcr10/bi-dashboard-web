import { runQuery } from "@/lib/bigquery";

const PROJECT = process.env.BIGQUERY_PROJECT_ID || "ageless-runway-483614-u8";
const DATASET = "procesadora_dm";

function table(name: string) {
  return `\`${PROJECT}.${DATASET}.${name}\``;
}

export interface ProduccionResumen {
  totalPesoIngresado: number;
  totalPesoSalida: number;
  totalPesoMerma: number;
  porcentajeMerma: number;
  totalMallas: number;
  rendimientoPromedio: number;
}

export interface ProduccionPorEspecie {
  Especie: string;
  PesoSalida: number;
  PesoMerma: number;
  PorcentajeMerma: number;
  Rendimiento: number;
}

export interface MermaPorTipo {
  NombreMermaLean: string;
  PesoMerma: number;
}

export interface TendenciaMerma {
  Mes: string;
  Anio: number;
  PesoMerma: number;
  PorcentajeMerma: number;
}

export interface TopProductosMerma {
  Producto: string;
  Especie: string;
  PesoMerma: number;
  PorcentajeMerma: number;
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

  return { whereClause, params };
}

export async function getProduccionResumen(filters?: Filters): Promise<ProduccionResumen> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      COALESCE(SUM(h.PesoIngresado), 0) as totalPesoIngresado,
      COALESCE(SUM(h.PesoSalida), 0) as totalPesoSalida,
      COALESCE(SUM(h.PesoMerma), 0) as totalPesoMerma,
      CASE 
      END as porcentajeMerma,
      COALESCE(SUM(h.CantidadMallas), 0) as totalMallas,
      CASE 
        WHEN SUM(h.PesoIngresado) > 0 
        THEN ROUND(SUM(h.PesoSalida) / SUM(h.PesoIngresado) * 100, 2)
        ELSE 0 
      END as rendimientoPromedio
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
  `;

  const rows = await runQuery<ProduccionResumen>(query, params);
  return rows[0] || {
    totalPesoIngresado: 0,
    totalPesoSalida: 0,
    totalPesoMerma: 0,
    porcentajeMerma: 0,
    totalMallas: 0,
    rendimientoPromedio: 0,
  };
}

export async function getProduccionPorEspecie(filters?: Filters): Promise<ProduccionPorEspecie[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      p.Especie,
      ROUND(SUM(h.PesoSalida), 2) as PesoSalida,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma,
      ROUND(SUM(h.PesoMerma) / NULLIF(SUM(h.PesoIngresado), 0) * 100, 2) as PorcentajeMerma,
      ROUND(SUM(h.PesoSalida) / NULLIF(SUM(h.PesoIngresado), 0) * 100, 2) as Rendimiento
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimProducto")} p ON h.ProductoKey = p.ProductoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY p.Especie
    ORDER BY PesoSalida DESC
  `;

  return runQuery<ProduccionPorEspecie>(query, params);
}

export async function getMermaPorTipo(filters?: Filters): Promise<MermaPorTipo[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      m.NombreMermaLean,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimMermaLean")} m ON h.MermaLeanKey = m.MermaLeanKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY m.NombreMermaLean
    ORDER BY PesoMerma DESC
  `;

  return runQuery<MermaPorTipo>(query, params);
}

export async function getTendenciaMerma(filters?: Filters): Promise<TendenciaMerma[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      t.Mes,
      t.Anio,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma,
      ROUND(SUM(h.PesoMerma) / NULLIF(SUM(h.PesoIngresado), 0) * 100, 2) as PorcentajeMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY t.Mes, t.Anio
    ORDER BY t.Anio, t.Mes
  `;

  return runQuery<TendenciaMerma>(query, params);
}

export async function getTopProductosMerma(limit: number = 10, filters?: Filters): Promise<TopProductosMerma[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      p.Producto,
      p.Especie,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma,
      ROUND(SUM(h.PesoMerma) / NULLIF(SUM(h.PesoIngresado), 0) * 100, 2) as PorcentajeMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimProducto")} p ON h.ProductoKey = p.ProductoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY p.Producto, p.Especie
    ORDER BY PesoMerma DESC
    LIMIT ${limit}
  `;

  return runQuery<TopProductosMerma>(query, params);
}
