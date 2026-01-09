import { BigQuery } from "@google-cloud/bigquery";
import path from "path";

let bigqueryClient: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
    if (!bigqueryClient) {
        const projectId = process.env.BIGQUERY_PROJECT_ID || "ageless-runway-483614-u8";

        // Helper function to try parsing JSON credentials
        const getCredentials = () => {
            // Priority 1: Explicit JSON variable
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
                try {
                    return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
                } catch (e) {
                    console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON", e);
                }
            }

            // Priority 2: Check if GOOGLE_APPLICATION_CREDENTIALS contains JSON (starts with {)
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS.trim().startsWith('{')) {
                try {
                    return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
                } catch (e) {
                    console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS as JSON", e);
                }
            }

            return null;
        };

        const credentials = getCredentials();

        if (credentials) {
            // Initialize with credential object
            bigqueryClient = new BigQuery({
                projectId,
                credentials,
            });
        } else {
            // Fallback: Use file-based credentials (local development or path provided)
            const credentialsPath = path.join(
                process.cwd(),
                process.env.GOOGLE_APPLICATION_CREDENTIALS || "./credentials/bigquery-service-account.json"
            );

            bigqueryClient = new BigQuery({
                projectId,
                keyFilename: credentialsPath,
            });
        }
    }

    return bigqueryClient;
}

export async function runQuery<T = Record<string, unknown>>(query: string): Promise<T[]> {
    const client = getBigQueryClient();

    const [rows] = await client.query({
        query,
        // Location removed to allow BigQuery to detect automatic location or use dataset default
    });

    return rows as T[];
}

export async function getDatasets(): Promise<string[]> {
    const client = getBigQueryClient();
    const [datasets] = await client.getDatasets();
    return datasets.map((ds) => ds.id || "");
}

export async function getTables(datasetId: string): Promise<string[]> {
    const client = getBigQueryClient();
    const dataset = client.dataset(datasetId);
    const [tables] = await dataset.getTables();
    return tables.map((t) => t.id || "");
}

export async function getTableSchema(datasetId: string, tableId: string) {
    const client = getBigQueryClient();
    const table = client.dataset(datasetId).table(tableId);
    const [metadata] = await table.getMetadata();
    return metadata.schema?.fields || [];
}

export async function getTablePreview(
    datasetId: string,
    tableId: string,
    limit: number = 100
): Promise<Record<string, unknown>[]> {
    const query = `SELECT * FROM \`${process.env.BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\` LIMIT ${limit}`;
    return runQuery(query);
}

export default getBigQueryClient;
