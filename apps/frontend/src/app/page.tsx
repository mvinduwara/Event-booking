import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingButton from '@/components/ui/BookingButton'; 

// Define the TypeScript interface for our Event data
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="w-full bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-primary">Eventify</h1>
        <div className="space-x-4">
          <Button variant="ghost">Log in</Button>
          <Button>Sign up</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold tracking-tight mb-6">
          Discover and Book Amazing Events
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          From tech conferences to live music, secure your spot at the best experiences happening near you.
        </p>
        <Button size="lg" className="text-lg px-8">
          Explore All Events
        </Button>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-3xl font-bold">Upcoming Events</h3>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-slate-500">No events found. Start by adding one to your database!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription>
                    {new Date(event.datetime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-slate-600 mb-4 line-clamp-3">{event.description}</p>
                  <div className="flex flex-col space-y-2 text-sm text-slate-500">
                    <span className="flex items-center">
                      📍 {event.venue?.name || 'Venue TBD'}
                    </span>
                    <span className="flex items-center">
                      🎟️ {event.capacity} seats available
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <BookingButton eventId={event.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}