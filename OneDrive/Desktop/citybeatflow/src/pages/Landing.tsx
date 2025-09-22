import { ArrowRight, CheckCircle, MapPin, Users, Shield, Smartphone, Camera, Navigation, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import heroImage from "@/assets/hero-civic-tech.jpg";
import enhancedWorkflow from "@/assets/enhanced-workflow.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Smartphone,
      title: "Easy Reporting",
      description: "Report issues with photos, location, and voice notes in seconds"
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Live map showing all reported issues and their current status"
    },
    {
      icon: Users,
      title: "Community Verification",
      description: "Citizens and NGOs can verify issues to prioritize municipal response"
    },
    {
      icon: Shield,
      title: "Municipal Dashboard",
      description: "Comprehensive admin tools for efficient issue management and routing"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Issues Resolved" },
    { number: "50+", label: "Cities Connected" },
    { number: "98%", label: "Citizen Satisfaction" },
    { number: "24hrs", label: "Average Response Time" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
                  Building <span className="bg-gradient-primary bg-clip-text text-transparent">Smarter</span> Cities Together
                </h1>
                <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
                  Empower citizens to report civic issues instantly while giving municipalities the tools to respond efficiently. Creating stronger communities through technology.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="xl"
                  onClick={() => navigate('/auth')}
                  className="group"
                >
                  Start Reporting Issues
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="xl"
                  onClick={() => navigate('/demo')}
                >
                  View Demo
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Civic Technology Platform" 
                className="w-full h-auto rounded-2xl shadow-civic"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How CivicTracker Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform connecting citizens, NGOs, and municipal governments for efficient civic issue resolution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-civic transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Workflow Section */}
          <div className="space-y-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group hover:shadow-civic transition-all duration-300 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Instant Capture</h4>
                  <p className="text-sm text-muted-foreground">Camera access for real-time photo reporting</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-civic transition-all duration-300 border-secondary/20">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Navigation className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Smart Location</h4>
                  <p className="text-sm text-muted-foreground">Auto GPS tagging and map integration</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-civic transition-all duration-300 border-accent/20">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">AI Routing</h4>
                  <p className="text-sm text-muted-foreground">Automatic department assignment</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-civic transition-all duration-300 border-success/20">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-success flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Live Tracking</h4>
                  <p className="text-sm text-muted-foreground">Real-time status and resolution updates</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-center text-foreground mb-6">
                  Complete Workflow Integration
                </h3>
                <img 
                  src={enhancedWorkflow} 
                  alt="Enhanced CivicTracker Workflow with Maps and Camera" 
                  className="w-full h-auto rounded-xl shadow-civic mx-auto"
                />
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Interactive Maps</h4>
                    <p className="text-sm text-muted-foreground">Real-time issue visualization on city maps</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                      <Camera className="h-6 w-6 text-secondary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Camera Integration</h4>
                    <p className="text-sm text-muted-foreground">Native camera access for instant reporting</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Community Power</h4>
                    <p className="text-sm text-muted-foreground">Crowdsourced verification and support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Your Community
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose your role and start making a difference today
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-civic transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Citizens</h3>
                <p className="text-muted-foreground mb-6">
                  Report issues in your neighborhood and track their resolution in real-time.
                </p>
                <Button 
                  variant="civic" 
                  className="w-full"
                  onClick={() => navigate('/auth?type=citizen')}
                >
                  Join as Citizen
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-civic transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-secondary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">NGOs</h3>
                <p className="text-muted-foreground mb-6">
                  Verify community issues and manage adopt-a-spot initiatives.
                </p>
                <Button 
                  variant="municipal" 
                  className="w-full"
                  onClick={() => navigate('/auth?type=ngo')}
                >
                  Join as NGO
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-civic transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Municipal</h3>
                <p className="text-muted-foreground mb-6">
                  Manage and resolve civic issues efficiently with comprehensive admin tools.
                </p>
                <Button 
                  variant="community" 
                  className="w-full"
                  onClick={() => navigate('/auth?type=admin')}
                >
                  Municipal Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gradient-hero rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Better Communities?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of citizens, NGOs, and municipalities already using CivicTracker
            </p>
            <Button 
              variant="secondary" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="group"
            >
              Get Started Today
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CT</span>
            </div>
            <span className="text-xl font-bold text-foreground">CivicTracker</span>
          </div>
          <p className="text-muted-foreground">
            Empowering communities through technology © 2024 CivicTracker
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;