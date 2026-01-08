import { create } from "zustand";
import type { Dashboard, DashboardWidget } from "@/types";

interface DashboardState {
    dashboard: Dashboard | null;
    filters: Record<string, unknown>;
    isEditing: boolean;
    setDashboard: (dashboard: Dashboard) => void;
    updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
    updateLayout: (layouts: { i: string; x: number; y: number; w: number; h: number }[]) => void;
    setFilter: (filterId: string, value: unknown) => void;
    clearFilters: () => void;
    setEditing: (editing: boolean) => void;
    addWidget: (widget: DashboardWidget) => void;
    removeWidget: (widgetId: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    dashboard: null,
    filters: {},
    isEditing: false,

    setDashboard: (dashboard) => set({ dashboard }),

    updateWidget: (widgetId, updates) =>
        set((state) => {
            if (!state.dashboard) return state;
            return {
                dashboard: {
                    ...state.dashboard,
                    widgets: state.dashboard.widgets.map((w) =>
                        w.id === widgetId ? { ...w, ...updates } : w
                    ),
                },
            };
        }),

    updateLayout: (layouts) =>
        set((state) => {
            if (!state.dashboard) return state;
            return {
                dashboard: {
                    ...state.dashboard,
                    widgets: state.dashboard.widgets.map((w) => {
                        const layout = layouts.find((l) => l.i === w.id);
                        if (layout) {
                            return {
                                ...w,
                                layout: { x: layout.x, y: layout.y, w: layout.w, h: layout.h },
                            };
                        }
                        return w;
                    }),
                },
            };
        }),

    setFilter: (filterId, value) =>
        set((state) => ({
            filters: { ...state.filters, [filterId]: value },
        })),

    clearFilters: () => set({ filters: {} }),

    setEditing: (editing) => set({ isEditing: editing }),

    addWidget: (widget) =>
        set((state) => {
            if (!state.dashboard) return state;
            return {
                dashboard: {
                    ...state.dashboard,
                    widgets: [...state.dashboard.widgets, widget],
                },
            };
        }),

    removeWidget: (widgetId) =>
        set((state) => {
            if (!state.dashboard) return state;
            return {
                dashboard: {
                    ...state.dashboard,
                    widgets: state.dashboard.widgets.filter((w) => w.id !== widgetId),
                },
            };
        }),
}));
