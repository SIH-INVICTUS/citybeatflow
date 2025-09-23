import { useEffect, useState } from "react";
import { Plus, MapPin, List, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IssuesMap from "@/components/civic/IssuesMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import StatusBadge from "@/components/civic/StatusBadge";
import { mockIssues, categoryIcons, type Issue } from "@/data/mockData";
import { getStoredIssues } from "@/lib/issuesStorage";
import { apiGet, apiPost } from "@/lib/api";
import { municipalCenter, withinRadius } from "@/lib/geo";
import { useNavigate } from "react-router-dom";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("map");

  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    (async () => {
      const email = localStorage.getItem('auth_email') || undefined;
      const local = getStoredIssues();
      setUserIssues(local);
      try {
        const [serverIssues, myServerIssues] = await Promise.all([
          apiGet<Issue[]>("/api/issues"),
          email ? apiGet<Issue[]>(`/api/issues?reporter=${encodeURIComponent(email)}`) : Promise.resolve([] as Issue[]),
        ]);
        const all = [...local, ...serverIssues];
        const filtered = all.filter(i => i?.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number' && withinRadius(municipalCenter, { lat: i.location.lat, lng: i.location.lng }, 15));
        setNearbyIssues(filtered);
        if (myServerIssues.length) setUserIssues(myServerIssues);
      } catch {
        const all = [...local, ...mockIssues];
        const filtered = all.filter(i => i?.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number' && withinRadius(municipalCenter, { lat: i.location.lat, lng: i.location.lng }, 15));
        setNearbyIssues(filtered);
      }
    })();
  }, []);

  const stats = [
    { label: "My Reports", value: String(userIssues.length), icon: List, onClick: () => setActiveTab('reports') },
    { label: "Resolved", value: String(nearbyIssues.filter(i => i.status === 'resolved').length), icon: Home, onClick: () => setActiveTab('community') },
    { label: "Community Impact", value: String(nearbyIssues.reduce((a, i) => a + i.verificationCount, 0)), icon: Users, onClick: () => setActiveTab('community') }
  ];

  const escalateReport = async (id: string) => {
    try {
      await apiPost(`/api/issues/${id}/escalate`, {});
      setUserIssues(prev => prev.map(u => (u._id === id || u.id === id) ? { ...u, escalated: true } : u));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userType="citizen" />
      
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Citizen Dashboard</h1>
            <p className="text-muted-foreground">Report issues and track community progress</p>
          </div>
          
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => navigate('/citizen/report')}
            className="group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Report Issue
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-civic transition-shadow cursor-pointer" onClick={stat.onClick}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <List className="h-4 w-4" />
              My Reports
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="adopt" className="gap-2">
              <Home className="h-4 w-4" />
              Adopt-a-Spot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <Card className="h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Nearby Issues Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(24rem-4.5rem)]">
                <IssuesMap issues={nearbyIssues} className="h-full" />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-civic transition-shadow cursor-pointer" onClick={() => navigate('/citizen/report')}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Plus className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Report New Issue</h3>
                      <p className="text-sm text-muted-foreground">Quick report with photo and location</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-civic transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-secondary flex items-center justify-center">
                      <Users className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Verify Issues</h3>
                      <p className="text-sm text-muted-foreground">Help verify nearby community reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Reported Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl">{categoryIcons[issue.category]}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                        <p className="text-xs text-muted-foreground">
                          Reported {new Date(issue.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <StatusBadge status={issue?.status || 'pending'} />
                        <Badge variant="outline" className="text-xs">
                          {issue.verificationCount} verifications
                        </Badge>
                      </div>
                    </div>
                  ))}
                    {userIssues.map(u => (
                      <Card key={u._id || u.id}>
                        <CardContent>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">{u.title}</div>
                              <div className="text-sm text-muted-foreground">{u.description}</div>
                              {u.escalated && <div className="text-xs text-warning">Escalated</div>}
                            </div>
                            <div className="text-right">
                              <StatusBadge status={(u as any)?.status || 'pending'} />
                            </div>
                          </div>
                          <div className="pt-3 flex gap-2">
                            {!u.escalated && (
                              <Button variant="outline" onClick={() => escalateReport(u._id || u.id)}>Escalate</Button>
                            )}
                            <Button onClick={() => navigate(`/citizen/report/${u._id || u.id}`)}>View</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Pulse - Verify Nearby Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-2xl">{categoryIcons[issue.category]}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {issue.verificationCount} community verifications
                        </p>
                      </div>
                      <div className="space-y-2">
                        <StatusBadge status={issue?.status || 'pending'} />
                        <Button variant="outline" size="sm">
                          Verify Issue
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adopt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adopt-a-Spot Initiative</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Adopted Spots Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Join our Adopt-a-Spot program to take care of specific areas in your community
                  </p>
                  <Button variant="civic">Browse Available Spots</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CitizenDashboard;