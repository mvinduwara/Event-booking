"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error'>('loading');

  useEffect(() => {
    const bookingId = searchParams.get('booking_id');
    
    if (bookingId) {
      fetch('http://localhost:8000/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      })
      .then(res => res.ok ? setStatus('confirmed') : setStatus('error'))
      .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-8 shadow-lg border-slate-200">
        
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <CardTitle className="text-2xl font-bold">Verifying Payment...</CardTitle>
          </div>
        )}

        {status === 'confirmed' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl">
              🎉
            </div>
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl font-extrabold text-slate-900">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <p className="text-slate-600">Your ticket has been secured. You can view your reservation in your dashboard.</p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700">View My Tickets</Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full">Browse More Events</Button>
                </Link>
              </div>
            </CardContent>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-4xl">
              ❌
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Something went wrong.</CardTitle>
            <p className="text-slate-600">We couldn't verify your booking. If you were charged, please contact support.</p>
            <Link href="/" className="w-full">
              <Button className="w-full">Return Home</Button>
            </Link>
          </div>
        )}

      </Card>
    </div>
  );
}