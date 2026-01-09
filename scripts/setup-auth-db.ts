
import { BigQuery } from "@google-cloud/bigquery";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const PROJECT_ID = process.env.BIGQUERY_PROJECT_ID || "procesadora-dm";
const DATASET_ID = "auth_system";

// Configurar cliente BigQuery
let bigquery: BigQuery;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    bigquery = new BigQuery({ projectId: PROJECT_ID, credentials });
} else {
    const credentialsPath = path.join(
        process.cwd(),
        process.env.GOOGLE_APPLICATION_CREDENTIALS || "./credentials/bigquery-service-account.json"
    );
    bigquery = new BigQuery({ projectId: PROJECT_ID, keyFilename: credentialsPath });
}

async function main() {
    console.log(`🚀 Iniciando configuración de base de datos en proyecto: ${PROJECT_ID}`);

    // 1. Crear Dataset
    try {
        const [dataset] = await bigquery.createDataset(DATASET_ID);
        console.log(`✅ Dataset ${dataset.id} creado.`);
    } catch (error: any) {
        if (error.code === 409) {
            console.log(`ℹ️  Dataset ${DATASET_ID} ya existe.`);
        } else {
            console.error("❌ Error creando dataset:", error);
            process.exit(1);
        }
    }

    // 2. Crear Tabla Roles
    const rolesSchema = [
        { name: "id", type: "STRING", mode: "REQUIRED" },
        { name: "name", type: "STRING", mode: "REQUIRED" },
        { name: "description", type: "STRING", mode: "NULLABLE" },
        { name: "permissions", type: "JSON", mode: "NULLABLE" },
        { name: "createdAt", type: "TIMESTAMP", mode: "REQUIRED" },
    ];

    const rolesTableId = "roles";
    try {
        const [table] = await bigquery.dataset(DATASET_ID).createTable(rolesTableId, { schema: rolesSchema });
        console.log(`✅ Tabla ${table.id} creada.`);

        // Insertar Roles por defecto
        const defaultRoles = [
            {
                id: crypto.randomUUID(),
                name: "ADMIN",
                description: "Administrador del sistema con acceso total",
                permissions: JSON.stringify(["*"]),
                createdAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                name: "GERENCIA",
                description: "Acceso de visualización gerencial",
                permissions: JSON.stringify(["VIEW_DASHBOARD", "VIEW_REPORTS"]),
                createdAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                name: "OPERADOR",
                description: "Acceso limitado operativo",
                permissions: JSON.stringify(["VIEW_DASHBOARD"]),
                createdAt: new Date().toISOString()
            }
        ];

        await table.insert(defaultRoles);
        console.log("✅ Roles por defecto insertados.");

    } catch (error: any) {
        if (error.code === 409) {
            console.log(`ℹ️  Tabla ${rolesTableId} ya existe.`);
        } else {
            console.error(`❌ Error creando tabla ${rolesTableId}:`, error);
        }
    }

    // 3. Crear Tabla Users
    const usersSchema = [
        { name: "id", type: "STRING", mode: "REQUIRED" },
        { name: "name", type: "STRING", mode: "REQUIRED" },
        { name: "email", type: "STRING", mode: "REQUIRED" }, // Debería ser UNIQUE, pero BQ no forza constraints. Lo manejamos en app.
        { name: "password_hash", type: "STRING", mode: "REQUIRED" },
        { name: "role_id", type: "STRING", mode: "REQUIRED" },
        { name: "isActive", type: "BOOLEAN", mode: "REQUIRED" },
        { name: "createdAt", type: "TIMESTAMP", mode: "REQUIRED" },
    ];

    const usersTableId = "users";
    try {
        const [table] = await bigquery.dataset(DATASET_ID).createTable(usersTableId, { schema: usersSchema });
        console.log(`✅ Tabla ${table.id} creada.`);

        // Buscar ID del rol ADMIN
        const [roles] = await bigquery.dataset(DATASET_ID).table(rolesTableId).query(`SELECT id FROM \`${PROJECT_ID}.${DATASET_ID}.roles\` WHERE name = 'ADMIN' LIMIT 1`);
        const adminRoleId = roles[0]?.id;

        if (adminRoleId) {
            // Insertar Usuario Admin por defecto
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const adminUser = {
                id: crypto.randomUUID(),
                name: "Administrador",
                email: "admin@procesadora.com",
                password_hash: hashedPassword,
                role_id: adminRoleId,
                isActive: true,
                createdAt: new Date().toISOString()
            };

            await table.insert(adminUser);
            console.log("✅ Usuario Admin por defecto insertado (admin@procesadora.com / admin123).");
        } else {
            console.warn("⚠️ No se pudo encontrar el rol ADMIN para crear el usuario admin.");
        }

    } catch (error: any) {
        if (error.code === 409) {
            console.log(`ℹ️  Tabla ${usersTableId} ya existe.`);
        } else {
            console.error(`❌ Error creando tabla ${usersTableId}:`, error);
        }
    }

    // 4. Crear Tabla Audit Logs
    const auditSchema = [
        { name: "id", type: "STRING", mode: "REQUIRED" },
        { name: "userId", type: "STRING", mode: "REQUIRED" },
        { name: "action", type: "STRING", mode: "REQUIRED" },
        { name: "details", type: "STRING", mode: "NULLABLE" },
        { name: "timestamp", type: "TIMESTAMP", mode: "REQUIRED" },
    ];

    const auditTableId = "audit_logs";
    try {
        const [table] = await bigquery.dataset(DATASET_ID).createTable(auditTableId, { schema: auditSchema });
        console.log(`✅ Tabla ${table.id} creada.`);
    } catch (error: any) {
        if (error.code === 409) {
            console.log(`ℹ️  Tabla ${auditTableId} ya existe.`);
        } else {
            console.error(`❌ Error creando tabla ${auditTableId}:`, error);
        }
    }

    console.log("🎉 Configuración de base de datos completada exitosamente.");
}

main();
