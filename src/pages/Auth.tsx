import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, CheckCircle, Shield } from "lucide-react";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'citizen';
  
  const [userType, setUserType] = useState<'citizen' | 'ngo' | 'admin'>(defaultType as 'citizen' | 'ngo' | 'admin');
  const [isLogin, setIsLogin] = useState(true);
  const [rolePasscode, setRolePasscode] = useState("");
  const { toast } = useToast();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Require role passcode for privileged roles
    if ((userType === 'ngo' && rolePasscode !== 'NGO25') || (userType === 'admin' && rolePasscode !== 'ADMIN25')) {
      toast({
        title: "Invalid role passcode",
        description: "Please enter the correct passcode for the selected role.",
        variant: "destructive",
      });
      return;
    }
    // Simulate authentication
    const dashboardRoutes = {
      citizen: '/citizen/dashboard',
      ngo: '/ngo/dashboard', 
      admin: '/admin/dashboard'
    };
    navigate(dashboardRoutes[userType]);
  };

  const userTypeConfig = {
    citizen: {
      icon: Users,
      title: "Citizen Access",
      description: "Report and track civic issues in your community",
      color: "text-primary"
    },
    ngo: {
      icon: CheckCircle, 
      title: "NGO Portal",
      description: "Verify issues and manage community initiatives",
      color: "text-secondary"
    },
    admin: {
      icon: Shield,
      title: "Municipal Admin",
      description: "Comprehensive dashboard for issue management",
      color: "text-accent"
    }
  };

  const currentConfig = userTypeConfig[userType];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-md mx-auto">
          <Card className="shadow-civic">
            <CardHeader className="text-center pb-6">
              <div className={`h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4`}>
                <currentConfig.icon className={`h-8 w-8 text-primary-foreground`} />
              </div>
              <CardTitle className="text-2xl">{currentConfig.title}</CardTitle>
              <p className="text-muted-foreground">{currentConfig.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* User Type Selector */}
              <div className="space-y-2">
                <Label>User Type</Label>
                <Tabs value={userType} onValueChange={(value) => setUserType(value as 'citizen' | 'ngo' | 'admin')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="citizen">Citizen</TabsTrigger>
                    <TabsTrigger value="ngo">NGO</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {(userType === 'ngo' || userType === 'admin') && (
                  <div className="space-y-2">
                    <Label htmlFor="role-passcode">Role Passcode</Label>
                    <Input
                      id="role-passcode"
                      placeholder={userType === 'admin' ? 'Enter Passcode' : 'Enter Passcode'}
                      value={rolePasscode}
                      onChange={(e) => setRolePasscode(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Only authorized {userType.toUpperCase()} users may proceed.</p>
                  </div>
                )}

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    {userType === 'ngo' && (
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization Name</Label>
                        <Input 
                          id="organization"
                          placeholder="Enter organization name"
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                <Button 
                  type="submit" 
                  variant="civic"
                  className="w-full"
                  size="lg"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;