export interface ApiResponse<T = unknown> {
    message: string;
    status: "ok" | "error";
    data?: T;
    timestamp: string;
}
