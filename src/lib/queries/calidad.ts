import { runQuery } from "@/lib/bigquery";

const PROJECT = process.env.BIGQUERY_PROJECT_ID || "ageless-runway-483614-u8";
const DATASET = "procesadora_dm";

function table(name: string) {
  return `\`${PROJECT}.${DATASET}.${name}\``;
}

export interface CalidadResumen {
  totalProductosCorrectos: number;
  totalProcesos: number;
}

export interface CalidadPorTurno {
  Turno: string;
  ProductosCorrectos: number;
  TotalProcesos: number;
}

export interface CalidadPorProducto {
  Producto: string;
  Especie: string;
  ProductosCorrectos: number;
}

export interface TopEmpleados {
  NombreCompleto: string;
  AntiguedadAnios: number;
  ProductosCorrectos: number;
  TotalProcesos: number;
  PromedioProductos: number;
}

export interface RendimientoPorAntiguedad {
  RangoAntiguedad: string;
  PromedioProductos: number;
  TotalEmpleados: number;
}

export async function getCalidadResumen(filters?: {
  anio?: number;
  mes?: string;
  planta?: string;
}): Promise<CalidadResumen> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
  if (filters?.mes) whereClause += ` AND t.Mes = '${filters.mes}'`;
  if (filters?.planta) whereClause += ` AND o.Planta = '${filters.planta}'`;

  const query = `
    SELECT 
      COALESCE(SUM(h.ProductosCorrectos), 0) as totalProductosCorrectos,
      COUNT(DISTINCT h.idProcesoEmpaque) as totalProcesos
    FROM ${table("HechoCalidadEmpaque")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
  `;

  const rows = await runQuery<CalidadResumen>(query);
  return rows[0] || {
    totalProductosCorrectos: 0,
    totalProcesos: 0,
  };
}

export async function getCalidadPorTurno(filters?: {
  anio?: number;
  planta?: string;
}): Promise<CalidadPorTurno[]> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;
  if (filters?.planta) whereClause += ` AND o.Planta = '${filters.planta}'`;

  const query = `
    SELECT 
      tu.Turno,
      SUM(h.ProductosCorrectos) as ProductosCorrectos,
      COUNT(DISTINCT h.idProcesoEmpaque) as TotalProcesos
    FROM ${table("HechoCalidadEmpaque")} h
    JOIN ${table("DimTurno")} tu ON h.TurnoKey = tu.TurnoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY tu.Turno
    ORDER BY ProductosCorrectos DESC
  `;

  return runQuery<CalidadPorTurno>(query);
}

export async function getCalidadPorProducto(filters?: {
  anio?: number;
}): Promise<CalidadPorProducto[]> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;

  const query = `
    SELECT 
      p.Producto,
      p.Especie,
      SUM(h.ProductosCorrectos) as ProductosCorrectos
    FROM ${table("HechoCalidadEmpaque")} h
    JOIN ${table("DimProducto")} p ON h.ProductoKey = p.ProductoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY p.Producto, p.Especie
    ORDER BY ProductosCorrectos DESC
  `;

  return runQuery<CalidadPorProducto>(query);
}

export async function getTopEmpleados(limit: number = 10, filters?: {
  anio?: number;
}): Promise<TopEmpleados[]> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;

  const query = `
    SELECT 
      e.NombreCompleto,
      e.AntiguedadAnios,
      SUM(h.ProductosCorrectos) as ProductosCorrectos,
      COUNT(DISTINCT h.idProcesoEmpaque) as TotalProcesos,
      ROUND(SUM(h.ProductosCorrectos) / NULLIF(COUNT(DISTINCT h.idProcesoEmpaque), 0), 2) as PromedioProductos
    FROM ${table("HechoCalidadEmpaque")} h
    JOIN ${table("DimEmpleado")} e ON h.EmpleadoKey = e.EmpleadoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY e.NombreCompleto, e.AntiguedadAnios
    ORDER BY ProductosCorrectos DESC
    LIMIT ${limit}
  `;

  return runQuery<TopEmpleados>(query);
}

export async function getRendimientoPorAntiguedad(filters?: {
  anio?: number;
}): Promise<RendimientoPorAntiguedad[]> {
  let whereClause = "WHERE 1=1";

  if (filters?.anio) whereClause += ` AND t.Anio = ${filters.anio}`;

  const query = `
    SELECT 
      CASE 
        WHEN e.AntiguedadAnios < 1 THEN '0-1 años'
        WHEN e.AntiguedadAnios < 3 THEN '1-3 años'
        WHEN e.AntiguedadAnios < 5 THEN '3-5 años'
        ELSE '5+ años'
      END as RangoAntiguedad,
      ROUND(AVG(h.ProductosCorrectos), 2) as PromedioProductos,
      COUNT(DISTINCT e.EmpleadoKey) as TotalEmpleados
    FROM ${table("HechoCalidadEmpaque")} h
    JOIN ${table("DimEmpleado")} e ON h.EmpleadoKey = e.EmpleadoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    ${whereClause}
    GROUP BY RangoAntiguedad
    ORDER BY PromedioProductos DESC
  `;

  return runQuery<RendimientoPorAntiguedad>(query);
}
