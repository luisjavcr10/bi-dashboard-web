import { NextResponse } from "next/server";
import { getDatasets } from "@/lib/bigquery";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const projectId = process.env.BIGQUERY_PROJECT_ID;
        const hasCredentialsJson = !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const credentialsStart = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim().substring(0, 10);

        const debugInfo = {
            projectId,
            hasCredentialsJson,
            hasCredentials,
            credentialsStart: hasCredentials ? `${credentialsStart}...` : 'N/A',
            env: process.env.NODE_ENV,
        };

        const datasets = await getDatasets();

        return NextResponse.json({
            status: "success",
            message: "BigQuery Connection Successful",
            data: datasets,
            debug: debugInfo
        });
    } catch (error: any) {
        console.error("BigQuery Test Error:", error);
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack,
            debug: {
                projectId: process.env.BIGQUERY_PROJECT_ID,
                hasCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
                hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
                credentialsType: typeof process.env.GOOGLE_APPLICATION_CREDENTIALS,
            }
        }, { status: 500 });
    }
}
