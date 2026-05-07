// apps/frontend/src/components/BookingButton.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface BookingButtonProps {
  eventId: string;
}

export default function BookingButton({ eventId }: BookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleBooking = async () => {
    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          ticket_count: 1, // Defaulting to 1 ticket for now
          user_email: "mvinduwara@demo.com" // Temporary user until real Auth is added
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book ticket');
      }

      setStatus('success');
      
      // Optional: Force a page refresh to update the "seats available" count
      // setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="w-full transition-all" 
      onClick={handleBooking} 
      disabled={isLoading || status === 'success'}
      variant={status === 'success' ? 'secondary' : status === 'error' ? 'destructive' : 'default'}
    >
      {isLoading && 'Processing...'}
      {status === 'idle' && !isLoading && 'Book Ticket'}
      {status === 'success' && 'Ticket Confirmed! 🎉'}
      {status === 'error' && 'Booking Failed - Try Again'}
    </Button>
  );
}