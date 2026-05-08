// apps/frontend/src/app/dashboard/DashboardUI.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { jsPDF } from "jspdf"; // PDF Generator

export default function DashboardUI({ userEmail }: { userEmail: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch Bookings
    fetch(`http://localhost:8000/api/bookings/user/${userEmail}`)
      .then(res => res.json())
      .then(data => setBookings(data));

    // Fetch Profile
    fetch(`http://localhost:8000/api/users/${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile_data) {
          setProfile({
            name: data.profile_data.name || "",
            phone: data.profile_data.phone || ""
          });
        }
        setLoading(false);
      });
  }, [userEmail]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('http://localhost:8000/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, ...profile })
    });
    setSaving(false);
    alert("Profile Updated Successfully!");
  };

  const downloadTicket = (booking: any) => {
    const doc = new jsPDF();
    
    // Add Graphics and Text to the PDF
    doc.setFillColor(37, 99, 235); // Blue header
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("EVENTIFY OFFICIAL TICKET", 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(`Event: ${booking.event.title}`, 20, 60);
    
    doc.setFontSize(12);
    doc.text(`Ticket Holder: ${profile.name || userEmail}`, 20, 80);
    doc.text(`Booking ID: ${booking.id}`, 20, 90);
    doc.text(`Date & Time: ${new Date(booking.event.datetime).toLocaleString()}`, 20, 100);
    doc.text(`Quantity: ${booking.ticket_count} Admit`, 20, 110);
    doc.text(`Status: ${booking.status}`, 20, 120);

    doc.setLineDashPattern([5, 5], 0);
    doc.line(20, 140, 190, 140);
    doc.text("Please present this ticket (digital or printed) at the entrance.", 20, 150);

    // Save the PDF securely to the user's computer
    doc.save(`Eventify-Ticket-${booking.event.title.replace(/\s+/g, '-')}.pdf`);
  };

  if (loading) return <div className="text-center py-20 animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto p-10 min-h-screen">
      <header className="mb-10 flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">User Dashboard</h1>
          <p className="text-slate-500 mt-2">Welcome back, {profile.name || userEmail}</p>
        </div>
        <Link href="/"><Button variant="outline">Browse Events</Button></Link>
      </header>
      
      <Tabs defaultValue="bookings">
        <TabsList className="mb-8">
          <TabsTrigger value="bookings">My Tickets</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          {bookings.length === 0 ? (
             <div className="bg-white border rounded-xl p-20 text-center space-y-4 shadow-sm">
             <p className="text-slate-400">You haven't booked any events yet.</p>
             <Link href="/"><Button variant="secondary">Find an Event</Button></Link>
           </div>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-xl">{booking.event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        📅 {new Date(booking.event.datetime).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className={booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {booking.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center border-t pt-4 mt-2">
                      <div className="text-sm text-slate-600">
                        <p>Tickets: <span className="font-bold text-slate-900">{booking.ticket_count}</span></p>
                        <p className="text-slate-400 font-mono text-xs mt-1">ID: {booking.id}</p>
                      </div>
                      
                      {/* PDF DOWNLOAD BUTTON */}
                      {booking.status === 'CONFIRMED' && (
                        <Button onClick={() => downloadTicket(booking)} className="bg-slate-900 hover:bg-slate-800">
                          📄 Download PDF Ticket
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card className="max-w-2xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your details so they appear correctly on your PDF tickets.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="space-y-2">
                  <Label>Email Address (Read Only)</Label>
                  <Input value={userEmail} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})} 
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})} 
                    placeholder="e.g. +1 234 567 8900"
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}