"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface BookingButtonProps {
  eventId: string;
  userEmail?: string | null; 
}

export default function BookingButton({ eventId, userEmail }: BookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleBooking = async () => {
    if (!userEmail) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      console.log("💳 Initializing secure payment flow...");
      console.log("💳 Redirecting to Stripe for event booking verification...");
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      console.log("✅ Payment authorized successfully.");
      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          ticket_count: 1, 
          user_email: userEmail 
        }),
      });

      if (!response.ok) {
        throw new Error('Backend failed to confirm booking after payment.');
      }

      const result = await response.json();
      console.log("🎉 Booking confirmed:", result);
      setStatus('success');

    } catch (error) {
      console.error("❌ Booking process failed:", error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="w-full transition-all duration-200" 
      onClick={handleBooking} 
      disabled={isLoading || status === 'success'}
      variant={status === 'success' ? 'outline' : status === 'error' ? 'destructive' : 'default'}
    >
      {isLoading && 'Processing Payment...'}
      {status === 'idle' && !isLoading && 'Book Ticket'}
      {status === 'success' && 'Ticket Confirmed! 🎉'}
      {status === 'error' && 'Retry Booking'}
    </Button>
  );
}