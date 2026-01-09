import { create } from 'zustand';

interface Message {
    role: "user" | "agent";
    content: string;
}

interface AgentState {
    dashboardName: string | null;
    dashboardData: Record<string, unknown> | null;
    chats: Record<string, Message[]>;
    setDashboardContext: (name: string, data: Record<string, unknown>) => void;
    addMessage: (dashboardName: string, message: Message) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
    dashboardName: null,
    dashboardData: null,
    chats: {},
    setDashboardContext: (name, data) => set({ dashboardName: name, dashboardData: data }),
    addMessage: (dashboardName, message) =>
        set((state) => ({
            chats: {
                ...state.chats,
                [dashboardName]: [...(state.chats[dashboardName] || []), message],
            },
        })),
}));
