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
        const ngoName = localStorage.getItem('auth_name') || ngoEmail;
        const events = await apiGet<any[]>(`/api/events?ngo=${encodeURIComponent(ngoEmail)}`);
        setEvents(events || []);
        // fetch issues and split between claimed-by-this-ngo and available
        const all = await apiGet<any[]>('/api/issues');
        const claimed = (all || []).filter(i => i && i.claimedByNGO && i.claimedByNGO === ngoName);
        const available = (all || []).filter(i => i && !i.claimedByNGO);
        setClaims(claimed || []);
        setAvailableIssues(available || []);
      } catch (err) {
        // ignore for now
      }
    })();
  }, []);

  const claimIssue = async (id: string) => {
    const ngoEmail = localStorage.getItem('auth_email') || '';
    const ngoName = localStorage.getItem('auth_name') || ngoEmail;
    try {
      await apiPost(`/api/ngo/issues/${id}/claim`, { ngoEmail });
      // refresh lists
      const all = await apiGet<any[]>('/api/issues');
      const claimed = (all || []).filter(i => i && i.claimedByNGO && i.claimedByNGO === ngoName);
      const available = (all || []).filter(i => i && !i.claimedByNGO);
      setClaims(claimed || []);
      setAvailableIssues(available || []);
    } catch (err) {
      // ignore
    }
  };

  // local state for available issues
  const [availableIssues, setAvailableIssues] = useState<any[]>([]);

  const navigate = (path: string) => {
    window.location.href = path;
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
                        <Button onClick={() => navigate(`/issues/${c._id}`)} className="ml-2">View Details</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports to Adopt</CardTitle>
            </CardHeader>
            <CardContent>
              {availableIssues.length === 0 ? <p className="text-sm text-muted-foreground">No available reports to adopt right now.</p> : (
                <ul className="space-y-3">
                  {availableIssues.map(a => (
                    <li key={a._id} className="border p-3 rounded">
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.description}</div>
                      <div className="pt-2">
                        <Button onClick={() => claimIssue(a._id)}>Adopt</Button>
                        <Button onClick={() => navigate(`/issues/${a._id}`)} className="ml-2">View Details</Button>
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
