import { useState } from "react";
import { BarChart3, Users, CheckCircle, Clock, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import StatusBadge from "@/components/civic/StatusBadge";
import { mockIssues, categoryIcons, departmentColors } from "@/data/mockData";
import { getStoredIssues } from "@/lib/issuesStorage";
import { municipalCenter, withinRadius } from "@/lib/geo";

const AdminDashboard = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const stats = [
    { 
      label: "Total Reports", 
      value: "1,247", 
      change: "+12%",
      icon: BarChart3,
      color: "text-primary"
    },
    { 
      label: "Pending Review", 
      value: "89", 
      change: "+5%",
      icon: Clock,
      color: "text-status-pending"
    },
    { 
      label: "In Progress", 
      value: "156", 
      change: "-8%",
      icon: Users,
      color: "text-status-progress"
    },
    { 
      label: "Resolved", 
      value: "1,002", 
      change: "+15%",
      icon: CheckCircle,
      color: "text-status-resolved"
    }
  ];

  const allIssues = [...getStoredIssues(), ...mockIssues];
  const muniScoped = allIssues.filter(i => withinRadius(municipalCenter, { lat: i.location.lat, lng: i.location.lng }, 50));
  const filteredIssues = muniScoped.filter(issue => {
    const statusMatch = filterStatus === "all" || issue.status === filterStatus;
    const categoryMatch = filterCategory === "all" || issue.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const highPriorityIssues = mockIssues.filter(issue => 
    issue.verificationCount >= 5 && ['high', 'critical'].includes(issue.priority)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header userType="admin" />
      
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Municipal Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive civic issue management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-civic transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-status-verified' : 'text-status-rejected'}`}>
                      {stat.change} this month
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 text-primary-foreground`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* High Priority Alerts */}
        {highPriorityIssues.length > 0 && (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">High Priority Issues Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highPriorityIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center gap-4 p-3 bg-background rounded-lg border">
                    <div className="text-xl">{categoryIcons[issue.category]}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                    </div>
                    <Badge variant="destructive">{issue.verificationCount} verifications</Badge>
                    <Badge className="bg-destructive text-destructive-foreground">{issue.priority} priority</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search issues by title, location, or reporter..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="pothole">Potholes</SelectItem>
                    <SelectItem value="streetlight">Street Lights</SelectItem>
                    <SelectItem value="trash">Trash/Sanitation</SelectItem>
                    <SelectItem value="water">Water Issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Management ({filteredIssues.length} issues)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer
                    ${issue.verificationCount >= 5 ? 'border-primary bg-primary/5' : ''}`}
                >
                  <div className="text-2xl">{categoryIcons[issue.category]}</div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                      <p className="text-xs text-muted-foreground">
                        Reported by {issue.reportedBy} • {new Date(issue.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <StatusBadge status={issue.status} />
                      {issue.department && (
                        <Badge variant="outline" className="text-xs">
                          {issue.department}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-right space-y-1">
                      <Badge 
                        variant={issue.priority === 'critical' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {issue.priority} priority
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {issue.verificationCount} verifications
                      </p>
                      {issue.estimatedResolution && (
                        <p className="text-xs text-muted-foreground">
                          Est: {new Date(issue.estimatedResolution).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="civic" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;