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

export async function getCalidadResumen(filters?: Filters): Promise<CalidadResumen> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      COALESCE(SUM(h.ProductosCorrectos), 0) as totalProductosCorrectos,
      COUNT(DISTINCT h.idProcesoEmpaque) as totalProcesos
    FROM ${table("HechoCalidadEmpaque")} h
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
  `;

  const rows = await runQuery<CalidadResumen>(query, params);
  return rows[0] || {
    totalProductosCorrectos: 0,
    totalProcesos: 0,
  };
}

export async function getCalidadPorTurno(filters?: Filters): Promise<CalidadPorTurno[]> {
  const { whereClause, params } = buildWhereClause(filters);

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

  return runQuery<CalidadPorTurno>(query, params);
}

export async function getCalidadPorProducto(filters?: Filters): Promise<CalidadPorProducto[]> {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT 
      p.Producto,
      p.Especie,
      SUM(h.ProductosCorrectos) as ProductosCorrectos
    FROM ${table("HechoCalidadEmpaque")} h
    JOIN ${table("DimProducto")} p ON h.ProductoKey = p.ProductoKey
    JOIN ${table("DimTiempo")} t ON h.TiempoKey = t.TiempoKey
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY p.Producto, p.Especie
    ORDER BY ProductosCorrectos DESC
  `;

  return runQuery<CalidadPorProducto>(query, params);
}

export async function getTopEmpleados(limit: number = 10, filters?: Filters): Promise<TopEmpleados[]> {
  const { whereClause, params } = buildWhereClause(filters);

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
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY e.NombreCompleto, e.AntiguedadAnios
    ORDER BY ProductosCorrectos DESC
    LIMIT ${limit}
  `;

  return runQuery<TopEmpleados>(query, params);
}

export async function getRendimientoPorAntiguedad(filters?: Filters): Promise<RendimientoPorAntiguedad[]> {
  const { whereClause, params } = buildWhereClause(filters);

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
    JOIN ${table("DimOrganizacion")} o ON h.OrganizacionKey = o.OrganizacionKey
    ${whereClause}
    GROUP BY RangoAntiguedad
    ORDER BY PromedioProductos DESC
  `;

  return runQuery<RendimientoPorAntiguedad>(query, params);
}
