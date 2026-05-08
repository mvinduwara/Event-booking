// apps/frontend/src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardUI from "./DashboardUI"; 

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-slate-500">Please log in to view your dashboard.</p>
        <Link href="/auth/signin"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return <DashboardUI userEmail={session.user.email} />;
}