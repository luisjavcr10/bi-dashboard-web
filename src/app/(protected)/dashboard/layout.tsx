import AgentFloatingButton from "@/components/agent/AgentFloatingButton";

export default function DashboardLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <>
   {children}
   <AgentFloatingButton />
  </>
 );
}
