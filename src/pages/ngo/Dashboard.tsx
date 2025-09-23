import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";

const NGODashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const ngoEmail = localStorage.getItem('auth_email') || '';
        const events = await apiGet<any[]>(`/api/events?ngo=${encodeURIComponent(ngoEmail)}`);
        setEvents(events || []);
        const claimed = await apiGet<any[]>(`/api/issues?claimedByNGO=${encodeURIComponent(ngoEmail)}`);
        setClaims(claimed || []);
      } catch (err) {
        // ignore for now
      }
    })();
  }, []);

  const claimIssue = async (id: string) => {
    const ngoName = localStorage.getItem('auth_name') || localStorage.getItem('auth_email') || 'NGO';
    await apiPost(`/api/issues/${id}/claim`, { ngo: ngoName });
    setClaims(prev => prev.map(c => c._id === id ? { ...c, claimedByNGO: ngoName, claimStatus: 'claimed' } : c));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userType="ngo" />
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? <p className="text-sm text-muted-foreground">No events yet.</p> : (
                <ul className="space-y-3">
                  {events.map(e => (
                    <li key={e._id} className="border p-3 rounded">
                      <div className="font-semibold">{e.title}</div>
                      <div className="text-sm text-muted-foreground">{new Date(e.date).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-4">
                <Button onClick={() => alert('Create event UI not implemented yet')}>Create Event</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claimed Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? <p className="text-sm text-muted-foreground">No claimed issues.</p> : (
                <ul className="space-y-3">
                  {claims.map(c => (
                    <li key={c._id} className="border p-3 rounded">
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-sm text-muted-foreground">{c.description}</div>
                      <div className="pt-2">
                        <Button onClick={() => alert('Add update UI not implemented')}>Add Update</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
