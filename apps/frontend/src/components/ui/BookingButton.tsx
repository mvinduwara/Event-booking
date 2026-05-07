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
  const router = useRouter();

  const handleBooking = async () => {
    if (!userEmail) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/bookings/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          user_email: userEmail
        }),
      });

      if (!response.ok) throw new Error('Failed to create payment session');

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; 
      }
      
    } catch (error) {
      console.error("❌ Checkout failed:", error);
      setIsLoading(false);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  return (
    <Button 
      className="w-full transition-all duration-200" 
      onClick={handleBooking} 
      disabled={isLoading}
    >
      {isLoading ? 'Redirecting to Checkout...' : 'Secure Checkout ($50.00)'}
    </Button>
  );
}