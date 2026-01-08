export interface ChartData {
    name: string;
    value: number;
    [key: string]: string | number;
}

export interface Widget {
    id: string;
    type: "bar" | "line" | "pie" | "area" | "kpi" | "table";
    title: string;
    dataSource: string;
    config: WidgetConfig;
}

export interface WidgetConfig {
    xAxisKey?: string;
    yAxisKey?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
}

export interface Dashboard {
    _id?: string;
    name: string;
    description?: string;
    widgets: DashboardWidget[];
    filters: DashboardFilter[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DashboardWidget extends Widget {
    layout: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}

export interface DashboardFilter {
    id: string;
    field: string;
    type: "select" | "date-range" | "range";
    label: string;
    value?: string | number | [Date, Date];
}

export interface ApiResponse<T = unknown> {
    message: string;
    status: "ok" | "error";
    data?: T;
    timestamp: string;
}
