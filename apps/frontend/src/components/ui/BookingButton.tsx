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
      // 1. Simulation of Payment Gateway Interaction
      // In a production environment, this would involve a redirect to Stripe or a similar service.
      console.log("💳 Initializing secure payment flow...");
      console.log("💳 Redirecting to Stripe for event booking verification...");
      
      // Artificial delay to mimic the external payment processing step
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      console.log("✅ Payment authorized successfully.");

      // 2. Finalize Booking on Backend
      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          ticket_count: 1, 
          user_email: "mvinduwara@demo.com" // Placeholder email until Auth session is fully linked
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