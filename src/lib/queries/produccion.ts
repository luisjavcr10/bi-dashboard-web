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
}

export interface ProduccionPorEspecie {
  Especie: string;
  PesoSalida: number;
  PesoMerma: number;
  PorcentajeMerma: number;
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

export async function getProduccionResumen(filters?: {
  anio?: number;
  mes?: string;
  dia?: number;
  planta?: string;
}): Promise<ProduccionResumen> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
  if (filters?.mes) whereClause += ` AND LOWER(t.Mes) = LOWER('${filters.mes}')`;
  if (filters?.dia) whereClause += ` AND t.Dia = ${filters.dia}`;
  if (filters?.planta) whereClause += ` AND LOWER(o.Planta) = LOWER('${filters.planta}')`;

  const query = `
    SELECT 
      COALESCE(SUM(h.PesoIngresado), 0) as totalPesoIngresado,
      COALESCE(SUM(h.PesoSalida), 0) as totalPesoSalida,
      COALESCE(SUM(h.PesoMerma), 0) as totalPesoMerma,
      CASE 
        WHEN SUM(h.PesoIngresado) > 0 
        THEN ROUND(SUM(h.PesoMerma) / SUM(h.PesoIngresado) * 100, 2)
        ELSE 0 
      END as porcentajeMerma,
      COALESCE(SUM(h.CantidadMallas), 0) as totalMallas
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
  `;

  const rows = await runQuery<ProduccionResumen>(query);
  return rows[0] || {
    totalPesoIngresado: 0,
    totalPesoSalida: 0,
    totalPesoMerma: 0,
    porcentajeMerma: 0,
    totalMallas: 0,
  };
}

export async function getProduccionPorEspecie(filters?: {
  anio?: number;
  mes?: string;
  dia?: number;
  planta?: string;
}): Promise<ProduccionPorEspecie[]> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
  if (filters?.mes) whereClause += ` AND LOWER(t.Mes) = LOWER('${filters.mes}')`;
  if (filters?.dia) whereClause += ` AND t.Dia = ${filters.dia}`;
  if (filters?.planta) whereClause += ` AND LOWER(o.Planta) = LOWER('${filters.planta}')`;

  const query = `
    SELECT 
      p.Especie,
      ROUND(SUM(h.PesoSalida), 2) as PesoSalida,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma,
      ROUND(SUM(h.PesoMerma) / NULLIF(SUM(h.PesoIngresado), 0) * 100, 2) as PorcentajeMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimProducto")} p ON h.ProductoKey = p.ProductoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY p.Especie
    ORDER BY PesoSalida DESC
  `;

  return runQuery<ProduccionPorEspecie>(query);
}

export async function getMermaPorTipo(filters?: {
  anio?: number;
  mes?: string;
  dia?: number;
}): Promise<MermaPorTipo[]> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
  if (filters?.mes) whereClause += ` AND LOWER(t.Mes) = LOWER('${filters.mes}')`;
  if (filters?.dia) whereClause += ` AND t.Dia = ${filters.dia}`;

  const query = `
    SELECT 
      m.NombreMermaLean,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimMermaLean")} m ON h.MermaLeanKey = m.MermaLeanKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY m.NombreMermaLean
    ORDER BY PesoMerma DESC
  `;

  return runQuery<MermaPorTipo>(query);
}

export async function getTendenciaMerma(filters?: {
  anio?: number;
  mes?: string;
  dia?: number;
}): Promise<TendenciaMerma[]> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
  if (filters?.mes) whereClause += ` AND LOWER(t.Mes) = LOWER('${filters.mes}')`;
  if (filters?.dia) whereClause += ` AND t.Dia = ${filters.dia}`;

  const query = `
    SELECT 
      t.Mes,
      t.Anio,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma,
      ROUND(SUM(h.PesoMerma) / NULLIF(SUM(h.PesoIngresado), 0) * 100, 2) as PorcentajeMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY t.Mes, t.Anio
    ORDER BY t.Anio, t.Mes
  `;

  return runQuery<TendenciaMerma>(query);
}

export async function getTopProductosMerma(limit: number = 10): Promise<TopProductosMerma[]> {
  const query = `
    SELECT 
      p.Producto,
      p.Especie,
      ROUND(SUM(h.PesoMerma), 2) as PesoMerma,
      ROUND(SUM(h.PesoMerma) / NULLIF(SUM(h.PesoIngresado), 0) * 100, 2) as PorcentajeMerma
    FROM ${table("HechoProduccionMerma")} h
    JOIN ${table("DimProducto")} p ON h.ProductoKey = p.ProductoKey
    GROUP BY p.Producto, p.Especie
    ORDER BY PesoMerma DESC
    LIMIT ${limit}
  `;

  return runQuery<TopProductosMerma>(query);
}
