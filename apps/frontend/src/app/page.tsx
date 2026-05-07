// apps/frontend/src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from "next-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingButton from '@/components/ui/BookingButton';

// Updated interface to include the new image_url
interface Event {
  id: string;
  title: string;
  description: string;
  datetime: string;
  capacity: number;
  image_url?: string | null;
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
      {/* Navigation Bar */}
      <nav className="w-full bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
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
              <span className="text-sm text-slate-400 pl-4 border-l">
                {session.user?.email}
              </span>
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

      {/* Hero Section */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900">
          Discover and Book Amazing Events
        </h2>
        <p className="text-xl text-slate-600 mb-10">
          Secure your spot at the best tech summits and experiences happening around the world.
        </p>
        <Button size="lg" className="text-lg px-8 shadow-md">
          Explore All Events
        </Button>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-3xl font-bold text-slate-900">Upcoming Events</h3>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No events found. Start by adding one in the Admin Dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                
                {/* Updated CardHeader with Image */}
                <CardHeader className="p-0">
                  {event.image_url ? (
                    <div className="w-full h-48 relative bg-slate-100">
                      <Image 
                        src={event.image_url} 
                        alt={event.title} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 font-medium">No Image Available</span>
                    </div>
                  )}
                  
                  <div className="p-6 pb-0">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 mb-3 border-blue-200">
                      Upcoming
                    </Badge>
                    <CardTitle className="text-xl font-bold text-slate-900 leading-tight">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 mt-2">
                      {new Date(event.datetime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow pt-4">
                  <p className="text-slate-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex flex-col space-y-2 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <span className="text-slate-400">📍</span> {event.venue?.name || 'Venue TBD'}
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <span className="text-slate-400">🎟️</span> {event.capacity} seats remaining
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-4 pb-6 bg-slate-50/50">
                  <BookingButton eventId={event.id} userEmail={session?.user?.email} />
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button variant="outline" className="w-full border-slate-200 hover:bg-white shadow-sm">
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