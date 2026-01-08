import { BigQuery } from "@google-cloud/bigquery";
import path from "path";

let bigqueryClient: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
    if (!bigqueryClient) {
        const projectId = process.env.BIGQUERY_PROJECT_ID || "ageless-runway-483614-u8";

        // Check if credentials are provided as JSON string (for Vercel/production)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            bigqueryClient = new BigQuery({
                projectId,
                credentials,
            });
        } else {
            // Use file-based credentials (for local development)
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
        location: "US",
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
