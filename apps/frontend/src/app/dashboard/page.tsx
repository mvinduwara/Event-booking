import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getMyBookings(email: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/bookings/user/${email}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-slate-500">Please log in to view your dashboard.</p>
        <Link href="/auth/signin"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const bookings = await getMyBookings(session.user?.email!);

  return (
    <div className="max-w-5xl mx-auto p-10 min-h-screen">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">User Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage your tickets and upcoming events.</p>
        </div>
        <Link href="/"><Button variant="outline">Browse More Events</Button></Link>
      </header>
      
      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b pb-2">My Reserved Tickets</h3>
        {bookings.length === 0 ? (
          <div className="bg-white border rounded-xl p-20 text-center space-y-4">
            <p className="text-slate-400">You haven't booked any events yet.</p>
            <Link href="/"><Button variant="secondary">Find an Event</Button></Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg">{booking.event.title}</CardTitle>
                    <p className="text-sm text-slate-500">
                      📅 {new Date(booking.event.datetime).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : ''}>
                    {booking.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pb-4 text-sm text-slate-600">
                  <div className="flex justify-between border-t pt-3">
                    <span>Tickets reserved: <span className="font-bold text-slate-900">{booking.ticket_count}</span></span>
                    <span className="text-slate-400 font-mono">ID: {booking.id.split('-')[0]}...</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}