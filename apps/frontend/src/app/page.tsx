// apps/frontend/src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from "next-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingButton from '@/components/ui/BookingButton';
import EventFilters from '@/components/EventFilters';

async function getEvents(searchParams: any) {
  try {
    const params = new URLSearchParams();
    if (searchParams?.search) params.set('search', searchParams.search);
    if (searchParams?.category) params.set('category', searchParams.category);

    const res = await fetch(`http://localhost:8000/api/events?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("🚨 Backend connection failed (getEvents):", error);
    return []; // Return empty array if backend is down
  }
}

async function getCategories() {
  try {
    const res = await fetch('http://localhost:8000/api/categories', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("🚨 Backend connection failed (getCategories):", error);
    return []; // Return empty array if backend is down
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<any> }) {
  // Resolve the searchParams promise for Next.js 15+
  const resolvedParams = await searchParams;
  
  const events = await getEvents(resolvedParams);
  const categories = await getCategories();
  const session = await getServerSession();

  return (
    <main className="min-h-screen bg-slate-50">
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
            </>
          ) : (
            <>
              <Link href="/auth/signin"><Button variant="ghost">Log in</Button></Link>
              <Link href="/auth/signup"><Button>Sign up</Button></Link>
            </>
          )}
        </div>
      </nav>

      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900">
          Discover and Book Amazing Events
        </h2>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        
        {/* INTERACTIVE FILTERS */}
        <EventFilters categories={categories} />

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No events found matching your search, or backend is offline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event: any) => (
              <Card key={event.id} className="flex flex-col hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                <CardHeader className="p-0">
                  {event.image_url ? (
                    <div className="w-full h-48 relative bg-slate-100">
                      <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 font-medium">No Image Available</span>
                    </div>
                  )}
                  <div className="p-6 pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>
                      {event.category && <Badge variant="outline">{event.category.name}</Badge>}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 leading-tight">{event.title}</CardTitle>
                    <CardDescription className="text-slate-500 mt-2">
                      {new Date(event.datetime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pt-4">
                  <p className="text-slate-600 mb-4 line-clamp-2 text-sm leading-relaxed">{event.description}</p>
                  <div className="flex flex-col space-y-2 text-sm text-slate-600">
                    <span className="flex items-center gap-2"><span className="text-slate-400">📍</span> {event.venue?.name || 'Venue TBD'}</span>
                    <span className="flex items-center gap-2 font-medium"><span className="text-slate-400">🎟️</span> {event.capacity} seats remaining</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4 pb-6 bg-slate-50/50">
                  <BookingButton eventId={event.id} userEmail={session?.user?.email} />
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button variant="outline" className="w-full border-slate-200 hover:bg-white shadow-sm">View Details</Button>
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