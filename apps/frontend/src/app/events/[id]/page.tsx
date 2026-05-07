import { getServerSession } from "next-auth";
import { Badge } from "@/components/ui/badge";
import BookingButton from "@/components/ui/BookingButton";
import Link from "next/link";
import Image from "next/image"; 

async function getEventDetails(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/events/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch event details:", error);
    return null;
  }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const event = await getEventDetails(resolvedParams.id);
  const session = await getServerSession();

  if (!event) {
    return <div className="text-center py-20">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="p-6 border-b bg-white shadow-sm">
        <Link href="/" className="text-primary font-medium hover:underline">← Back to Events</Link>
      </nav>

      {event.image_url && (
        <div className="w-full h-64 md:h-96 relative bg-slate-200">
          <Image src={event.image_url} alt={event.title} fill className="object-cover" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          <Badge variant="outline" className="mb-2 bg-white">Confirmed Event</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">{event.title}</h1>
          
          <div className="flex items-center text-slate-500 space-x-4 py-2">
            <span>📅 {new Date(event.datetime).toLocaleString()}</span>
            <span>📍 {event.venue?.name || "TBD"}</span>
          </div>

          <div className="prose prose-slate max-w-none bg-white p-6 rounded-xl border">
            <h3 className="text-xl font-bold mb-4">About this event</h3>
            <p className="text-slate-600 leading-relaxed">{event.description}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-4">Venue Facilities</h3>
            <div className="flex flex-wrap gap-2">
              {event.venue?.facilities?.map((f: string) => (
                <Badge key={f} variant="secondary">{f}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
            <h3 className="text-2xl font-bold mb-2">$0.00</h3> 
            <p className="text-sm text-slate-500 mb-6">Free Entry (Beta Testing)</p>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Availability</span>
                <span className="font-medium text-green-600">{event.capacity} seats left</span>
              </div>
              
              <BookingButton eventId={event.id} userEmail={session?.user?.email} />
              
              <p className="text-xs text-center text-slate-400 mt-4">
                Secure your spot instantly. <br/>
                {session ? 'Logged in securely.' : 'Requires sign in.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}