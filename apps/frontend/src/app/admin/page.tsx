"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const [venues, setVenues] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/venues')
      .then(res => res.json())
      .then(data => setVenues(data));
      
    fetch('http://localhost:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const uploadImage = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch('http://localhost:8000/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url; 
  };

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const imageUrl = await uploadImage();

    const formData = new FormData(e.currentTarget);
    const eventData = Object.fromEntries(formData.entries());
    
    if (imageUrl) eventData.image_url = imageUrl;
    
    if (!eventData.category_id || eventData.category_id === 'unassigned') {
      delete eventData.category_id;
    }

    await fetch('http://localhost:8000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    setLoading(false);
    alert("Event Created Successfully!");
    window.location.reload();
  };

  const handleVenueSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    await fetch('http://localhost:8000/api/venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    setLoading(false);
    alert("Venue Registered Successfully!");
    window.location.reload();
  };

  return (
    <div className="p-10 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="events">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Manage Events</TabsTrigger>
          <TabsTrigger value="venues">Manage Venues</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                
                <div className="space-y-2 p-4 border border-dashed bg-slate-50 rounded-lg">
                  <Label htmlFor="image">Event Cover Image (Optional)</Label>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="datetime">Date & Time</Label>
                    <Input id="datetime" name="datetime" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" name="capacity" type="number" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Select name="venue_id" required>
                      <SelectTrigger><SelectValue placeholder="Select a venue" /></SelectTrigger>
                      <SelectContent>
                        {venues.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Select name="category_id">
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">None</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="venues">
          <Card>
            <CardHeader>
              <CardTitle>Register Venue</CardTitle>
              <CardDescription>Add a new location to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVenueSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Venue Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Grand Arena" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-capacity">Total Capacity</Label>
                  <Input id="v-capacity" name="capacity" type="number" required />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Registering..." : "Register Venue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}