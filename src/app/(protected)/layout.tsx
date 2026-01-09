import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 const session = await auth();

 if (!session?.user) {
  redirect("/sign-in");
 }

 return (
  <div className="flex h-screen bg-gray-950">
   <Sidebar user={session.user} />
   <main className="flex-1 w-full min-w-0 bg-gray-950 transition-all duration-300 overflow-y-auto">
    {children}
   </main>
  </div>
 );
}
