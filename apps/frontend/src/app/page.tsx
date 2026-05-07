import Link from 'next/link';
import { getServerSession } from "next-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingButton from '@/components/ui/BookingButton';

interface Event {
  id: string;
  title: string;
  description: string;
  datetime: string;
  capacity: number;
  venue: {
    name: string;
    address: string;
  };
}

async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch('http://localhost:8000/api/events', { 
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export default async function Home() {
  const events = await getEvents();
  const session = await getServerSession();

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="w-full bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-primary">Eventify</h1>
        <div className="space-x-4 flex items-center">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                My Bookings
              </Link>
              <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                Admin
              </Link>
              <Button variant="outline" size="sm">Logout</Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold tracking-tight mb-6 text-slate-900">
          Discover and Book Amazing Events
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Secure your spot at the best tech summits and experiences happening in 2026.
        </p>
        <Button size="lg" className="text-lg px-8 shadow-md">
          Explore All Events
        </Button>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-3xl font-bold text-slate-900">Upcoming Events</h3>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No events found. Start by adding one in the Admin Dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col hover:shadow-xl transition-all duration-300 border-slate-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Upcoming</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{event.title}</CardTitle>
                  <CardDescription className="text-slate-500">
                    {new Date(event.datetime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-slate-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex flex-col space-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="text-slate-400">📍</span> {event.venue?.name || 'TBD'}
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <span className="text-slate-400">🎟️</span> {event.capacity} seats left
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-4">
                  <BookingButton eventId={event.id} userEmail={session?.user?.email} />
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}