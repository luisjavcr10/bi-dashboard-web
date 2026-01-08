// ============================================
// DIMENSION TABLES
// ============================================

export interface DimProducto {
    ProductoKey: number;
    idEspecie: number;
    Especie: string;
    Producto: string;
    tiempoIdealEmpaque: number;
}

export interface DimCausaParada {
    CausaKey: number;
    idCausa: number;
    Causa: string;
}

export interface DimEmpleado {
    EmpleadoKey: number;
    idEmpleado: number;
    DNI: string;
    NombreCompleto: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    AntiguedadAnios: number;
}

export interface DimMermaLean {
    MermaLeanKey: number;
    idMermaLean: number;
    NombreMermaLean: string;
}

export interface DimOrganizacion {
    OrganizacionKey: number;
    idPlanta: number;
    Planta: string;
    Sucursal: string;
}

export interface DimProduccion {
    ProduccionKey: number;
    idEtapa: number;
    Etapa: string;
    Tipo: string;
}

export interface DimTiempo {
    TiempoKey: number;
    Fecha: string; // DATETIME in BigQuery -> ISO string
    Anio: number;
    Mes: string;
    Dia: string;
    Hora: string; // TIME in BigQuery -> string HH:MM:SS
}

export interface DimTurno {
    TurnoKey: number;
    idTurno: number;
    Turno: string;
}

// ============================================
// FACT TABLES
// ============================================

export interface HechoCalidadEmpaque {
    CalidadEmpaqueKey: number;
    TiempoKey: number;
    TurnoKey: number;
    EmpleadoKey: number;
    OrganizacionKey: number;
    ProductoKey: number;
    MermaLeanKey: number;
    ProductosCorrectos: number;
    idProcesoEmpaque: number;
}

export interface HechoParadas {
    ParadaKey: number;
    TiempoKey: number;
    TurnoKey: number;
    CausaKey: number;
    ProduccionKey: number;
    ProductoKey: number;
    OrganizacionKey: number;
    MermaLeanKey: number;
    TotalDuracionParada: number;
    NumeroParadas: number;
    DuracionTurno: number;
    idParada: number;
    idProceso: number;
    idProcesoEmpaque: number;
}

export interface HechoProduccionMerma {
    ProduccionMermaKey: number;
    TiempoKey: number;
    TurnoKey: number;
    ProduccionKey: number;
    EmpleadoKey: number;
    OrganizacionKey: number;
    ProductoKey: number;
    MermaLeanKey: number;
    PesoIngresado: number;
    PesoSalida: number;
    CantidadMallas: number;
    PesoMerma: number;
    DuracionProcesamiento: number;
    idProceso: number;
    idProcesoSalida: number;
}

// ============================================
// TYPE UNIONS
// ============================================

export type DimensionTable =
    | DimProducto
    | DimCausaParada
    | DimEmpleado
    | DimMermaLean
    | DimOrganizacion
    | DimProduccion
    | DimTiempo
    | DimTurno;

export type FactTable =
    | HechoCalidadEmpaque
    | HechoParadas
    | HechoProduccionMerma;

export type BigQueryTable = DimensionTable | FactTable;

// ============================================
// TABLE NAMES
// ============================================

export const DIMENSION_TABLES = [
    "DimProducto",
    "DimCausaParada",
    "DimEmpleado",
    "DimMermaLean",
    "DimOrganizacion",
    "DimProduccion",
    "DimTiempo",
    "DimTurno",
] as const;

export const FACT_TABLES = [
    "HechoCalidadEmpaque",
    "HechoParadas",
    "HechoProduccionMerma",
] as const;

export type DimensionTableName = typeof DIMENSION_TABLES[number];
export type FactTableName = typeof FACT_TABLES[number];
export type TableName = DimensionTableName | FactTableName;
