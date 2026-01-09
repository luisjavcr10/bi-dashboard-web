import pandas as pd
from sqlalchemy import create_engine
from google.cloud import bigquery
from google.oauth2 import service_account
import urllib
import os
import shutil

#=========== CONFIGURACION
#SQL SERVER - Origen de datos
SERVER_NAME='.'
DATABASE_NAME='PROCESADORA'
DRIVER='{ODBC Driver 17 for SQL Server}'

# BIGQUERY - Destino de datos
PROJECT_ID = 'procesadora-dm'
DATASET_ID = 'procesadora_dm'
KEY_PATH = 'procesadora-dm-9582e56d0cb4.json'

# CARPETA TEMPORAL PARA CSV
TEMP_FOLDER = r'.\data_temp'

QUERIES = {
    # =========================================================
    # DIMENSIÓN TIEMPO (CORREGIDA PARA EVITAR DUPLICADOS)
    # =========================================================
    'DimTiempo': """
        /* ESTRATEGIA: 
           1. Primero recolectamos todas las fechas crudas.
           2. Las convertimos a DATETIME2(0) para redondear al segundo exacto.
           3. Hacemos DISTINCT sobre esa fecha limpia.
           4. Recién ahí generamos los Keys y atributos.
        */
        SELECT 
            CAST(FORMAT(FechaLimpia, 'yyyyMMddHHmmss') AS BIGINT) as TiempoKey,
            CAST(FechaLimpia AS DATETIME) as Fecha,
            YEAR(FechaLimpia) as Anio,
            DATENAME(MONTH, FechaLimpia) as Mes,
            DATENAME(WEEKDAY, FechaLimpia) as Dia,
            CAST(FechaLimpia AS TIME(0)) as Hora
        FROM (
            SELECT DISTINCT 
                CAST(fechaInicio AS DATETIME2(0)) as FechaLimpia
            FROM (
                SELECT fechaInicio FROM PROCESADORA.dbo.Proceso
                UNION
                SELECT fechaInicio FROM PROCESADORA.dbo.ParadaNoProgramada
                UNION
                SELECT fechaInicio FROM PROCESADORA.dbo.ProcesoEmpaque
            ) AS U
            WHERE U.fechaInicio IS NOT NULL
        ) AS T
    """,

    'DimTurno': """
        SELECT idTurno as TurnoKey, idTurno, turno as Turno FROM Turno
    """,

    'DimProduccion': """
        SELECT 
            e.idEtapa as ProduccionKey, e.idEtapa, e.nombre as Etapa,
            ISNULL(tp.tipoProduccion, 'Sin Tipo') as Tipo
        FROM Etapa e
        LEFT JOIN TipoProduccion tp ON e.idTipoProduccion = tp.idTipoProduccion
    """,

    'DimEmpleado': """
        SELECT 
            e.idEmpleado as EmpleadoKey, e.idEmpleado, e.dni as DNI,
            e.nombres + ' ' + e.apellidoPaterno + ' ' + e.apellidoMaterno as NombreCompleto,
            e.apellidoPaterno, e.apellidoMaterno,
            DATEDIFF(YEAR, c.fechaInicio, GETDATE()) AS AntiguedadAnios
        FROM PROCESADORA.dbo.Empleado e
        LEFT JOIN (SELECT idEmpleado, MIN(fechaInicio) as fechaInicio FROM PROCESADORA.dbo.Contrato GROUP BY idEmpleado) c ON e.idEmpleado = c.idEmpleado
    """,

    'DimOrganizacion': """
        SELECT 
            p.idPlanta as OrganizacionKey, p.idPlanta,
            ISNULL(p.planta, 'Sin Nombre') as Planta,
            ISNULL(s.sucursal, 'Sin Sucursal') as Sucursal
        FROM Planta p
        LEFT JOIN Sucursal s ON p.idSucursal = s.idSucursal
    """,

    'DimProducto': """
        SELECT 
            e.idEspecie as ProductoKey, e.idEspecie, e.especie as Especie,
            ISNULL(p.producto, 'Sin Producto Base') as Producto,
            e.tiempoIdealEmpaqueCongelado as tiempoIdealEmpaque
        FROM Especie e
        LEFT JOIN Producto p ON e.idProducto = p.idProducto
    """,

    'DimCausaParada': """
        SELECT idCausa as CausaKey, idCausa, causa as Causa FROM CausaParada
    """,

    'DimMermaLean': """
        SELECT idMermaLean as MermaLeanKey, idMermaLean, mermaLean as NombreMermaLean FROM MermaLean
    """,
    
    # =========================================================
    # TABLAS DE HECHOS (CON TIEMPOKEY NORMALIZADO)
    # =========================================================
    
    'HechoProduccionMerma': """
        SELECT 
            ROW_NUMBER() OVER(ORDER BY p.idProceso) as ProduccionMermaKey,
            
            -- FIX CRITICO: Normalizar la fecha antes de generar el Key para que coincida con DimTiempo
            ISNULL(CAST(FORMAT(CAST(p.fechaInicio AS DATETIME2(0)), 'yyyyMMddHHmmss') AS BIGINT), -1) as TiempoKey,
            
            ISNULL(p.idTurno, -1) as TurnoKey,
            ISNULL(p.idEtapa, -1) as ProduccionKey,
            ISNULL(p.idEmpleado, -1) as EmpleadoKey,
            ISNULL(l.idPlanta, -1) as OrganizacionKey,
            ISNULL(l.idEspecie, -1) as ProductoKey,
            ISNULL(dm_trans.idMermaLean, -1) as MermaLeanKey,
            
            ISNULL(pe.pesoIngresado, 0) as PesoIngresado,
            ISNULL(ps.pesoSalida, 0) as PesoSalida,
            ISNULL(pe.cantidadMallas, 0) as CantidadMallas,
            ISNULL(ps.pesoMerma, 0) as PesoMerma, -- Usamos el dato directo de BD
            CAST(DATEDIFF(MINUTE, p.fechaInicio, p.fechaFin) AS DECIMAL(6,2)) as DuracionProcesamiento,
            
            p.idProceso,
            ps.idProcesoSalida,
            GETDATE() as FechaRegistro
        FROM PROCESADORA.dbo.Proceso p
        LEFT JOIN PROCESADORA.dbo.ProcesoEntrada pe ON p.idProceso = pe.idProceso
        LEFT JOIN PROCESADORA.dbo.ProcesoSalida ps ON p.idProceso = ps.idProceso
        LEFT JOIN PROCESADORA.dbo.Lote l ON p.idLote = l.idLote
        LEFT JOIN PROCESADORA.dbo.DetalleMerma dm_trans ON ps.idProcesoSalida = dm_trans.idProcesoSalida
    """,
    
    'HechoParadas': """
        SELECT 
            ROW_NUMBER() OVER(ORDER BY pnp.idParada) as ParadaKey,
            
            -- FIX CRITICO: Normalizar fecha
            ISNULL(CAST(FORMAT(CAST(pnp.fechaInicio AS DATETIME2(0)), 'yyyyMMddHHmmss') AS BIGINT), -1) as TiempoKey,
            
            ISNULL(pnp.idTurno, -1) as TurnoKey,
            ISNULL(pnp.idCausa, -1) as CausaKey,
            ISNULL(p.idEtapa, -1) as ProduccionKey,
            ISNULL(l.idEspecie, -1) as ProductoKey,
            ISNULL(l.idPlanta, -1) as OrganizacionKey,
            ISNULL(pnp.idMermaLean, -1) as MermaLeanKey,
            
            ISNULL(pnp.duracionMinutos, 0) as TotalDuracionParada,
            1 as NumeroParadas, 
            CASE 
                WHEN t_trans.horaFin < t_trans.horaInicio 
                THEN DATEDIFF(MINUTE, t_trans.horaInicio, t_trans.horaFin) + 1440 
                ELSE DATEDIFF(MINUTE, t_trans.horaInicio, t_trans.horaFin)
            END as DuracionTurno,
            
            pnp.idParada,
            pnp.idProceso,
            pnp.idProcesoEmpaque,
            GETDATE() as FechaRegistro
        FROM PROCESADORA.dbo.ParadaNoProgramada pnp
        LEFT JOIN PROCESADORA.dbo.Proceso p ON pnp.idProceso = p.idProceso
        LEFT JOIN PROCESADORA.dbo.Lote l ON p.idLote = l.idLote
        LEFT JOIN PROCESADORA.dbo.Turno t_trans ON pnp.idTurno = t_trans.idTurno
    """,
    
    'HechoCalidadEmpaque': """
        SELECT 
            ROW_NUMBER() OVER(ORDER BY pe.idProcesoEmpaque) as CalidadEmpaqueKey,
            
            -- FIX CRITICO: Normalizar fecha
            ISNULL(CAST(FORMAT(CAST(pe.fechaInicio AS DATETIME2(0)), 'yyyyMMddHHmmss') AS BIGINT), -1) as TiempoKey,
            
            ISNULL(p.idTurno, -1) as TurnoKey,
            ISNULL(pe.idEmpleado, -1) as EmpleadoKey,
            ISNULL(l.idPlanta, -1) as OrganizacionKey,
            ISNULL(l.idEspecie, -1) as ProductoKey,
            ISNULL(pe.idMermaLean, -1) as MermaLeanKey,
            
            ISNULL(pe.productosCorrectos, 0) as ProductosCorrectos,
            pe.idProcesoEmpaque,
            GETDATE() as FechaRegistro
        FROM PROCESADORA.dbo.ProcesoEmpaque pe
        INNER JOIN PROCESADORA.dbo.Empleado e_trans ON pe.idEmpleado = e_trans.idEmpleado
        INNER JOIN PROCESADORA.dbo.Puesto pu_trans ON e_trans.idPuesto = pu_trans.idPuesto
        LEFT JOIN PROCESADORA.dbo.ProcesoSalida ps ON pe.idProcesoSalida = ps.idProcesoSalida
        LEFT JOIN PROCESADORA.dbo.Proceso p ON ps.idProceso = p.idProceso
        LEFT JOIN PROCESADORA.dbo.Lote l ON p.idLote = l.idLote
        WHERE pu_trans.tipoPuesto = 'Operario de Etiquetado y Empaque'
    """
}


def main():
    # Conexion a SQL Server
    print("Conectando a SQL Server (Transaccional)...")
    params = urllib.parse.quote_plus(
        f'DRIVER={DRIVER};'
        f'SERVER={SERVER_NAME};'
        f'DATABASE={DATABASE_NAME};'
        f'Trusted_Connection=yes;'
    )
    
    engine = create_engine(f'mssql+pyodbc:///?odbc_connect={params}')
    
    # Preparar entorno temporal
    if os.path.exists(TEMP_FOLDER):
        shutil.rmtree(TEMP_FOLDER) # Limpiar carpeta si existe
    os.makedirs(TEMP_FOLDER)
    print(f"Carpeta temporal creada en {TEMP_FOLDER}")
    
    # Conexion a Bigquery
    print("Conectando a Google BigQuery...")
    credentials = service_account.Credentials.from_service_account_file(KEY_PATH)
    client = bigquery.Client(credentials=credentials, project=PROJECT_ID)
    
    # CICLO ETL (Extraer -> Transformar -> Cargar)
    for table_name, sql_query in QUERIES.items():
        print(f"\n Procesando: {table_name}")
        
        try:
            # Extraer y transformar
            print("   Extrayendo y transformando datos desde SQL Server...")
            df = pd.read_sql_query(sql_query, engine)
            
            if df.empty:
                print(f"     La consulta para {table_name} no devolvió datos. Se omite la carga.")
                continue
            
            # Guardar temporalmente como CSV
            csv_path = os.path.join(TEMP_FOLDER, f"{table_name}.csv")
            df.to_csv(csv_path, index=False, encoding='utf-8', sep=',')
            print(f"    Datos guardados temporalmente en {csv_path} con {len(df)} registros.")
            
            # --- Cargar a BigQuery ---
            print("    Cargando datos a BigQuery...")
            table_ref = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"
            
            job_config = bigquery.LoadJobConfig(
                source_format=bigquery.SourceFormat.CSV,
                skip_leading_rows=1,
                write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE, # Sobrescribir tabla
                allow_quoted_newlines=True,
                encoding="UTF-8"
            )
            
            with open(csv_path, "rb") as source_file:
                job = client.load_table_from_file(source_file, table_ref, job_config=job_config)
                job.result()  # Esperar a que el trabajo de carga se complete
                
                table = client.get_table(table_ref)
                print(f"   [OK] Cargado {table.num_rows} registros en la tabla {table_name}.")
                
        except Exception as e:
            print(f"    [ERROR] No se pudo procesar la tabla {table_name}. Error: {e}")
            
    print("\nETL completado exitosamente.")
    
if __name__ == "__main__":
    print("----Iniciando el proceso ETL de SQL Server a BigQuery----")
    main()   
