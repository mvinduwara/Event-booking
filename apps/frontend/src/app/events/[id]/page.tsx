// apps/frontend/src/app/events/[id]/page.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookingButton from "@/components/BookingButton"; 
import Link from "next/link";

async function getEventDetails(id: string) {
  const res = await fetch(`http://localhost:8000/api/events/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEventDetails(params.id);

  if (!event) {
    return <div className="text-center py-20">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="p-6 border-b bg-white">
        <Link href="/" className="text-primary font-medium">← Back to Events</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Badge variant="outline" className="mb-2">Confirmed Event</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">{event.title}</h1>
          
          <div className="flex items-center text-slate-500 space-x-4 py-2">
            <span>📅 {new Date(event.datetime).toLocaleString()}</span>
            <span>📍 {event.venue.name}</span>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold">About this event</h3>
            <p className="text-slate-600 leading-relaxed">{event.description}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-4">Venue Facilities</h3>
            <div className="flex flex-wrap gap-2">
              {event.venue.facilities.map((f: string) => (
                <Badge key={f} variant="secondary">{f}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
            <h3 className="text-2xl font-bold mb-2">$0.00</h3> {/* Add pricing field to DB later */}
            <p className="text-sm text-slate-500 mb-6">Free Entry (Beta Testing)</p>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Availability</span>
                <span className="font-medium text-green-600">{event.capacity} seats left</span>
              </div>
              <BookingButton eventId={event.id} />
              <p className="text-xs text-center text-slate-400">
                Secure your spot instantly. No registration required yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}