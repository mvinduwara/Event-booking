// apps/frontend/src/components/ui/BookingButton.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface BookingButtonProps {
  eventId: string;
  userEmail?: string | null; // Added prop for real session data
}

export default function BookingButton({ eventId, userEmail }: BookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleBooking = async () => {
    // 1. Security Check: Ensure user is logged in
    if (!userEmail) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      // 2. Simulation of Payment Gateway Interaction
      console.log("💳 Initializing secure payment flow...");
      console.log("💳 Redirecting to Stripe for event booking verification...");
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      console.log("✅ Payment authorized successfully.");

      // 3. Finalize Booking on Backend using the REAL user's email
      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          ticket_count: 1, 
          user_email: userEmail // Replaced the hardcoded demo email
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