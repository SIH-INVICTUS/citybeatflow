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
import { apiPost, setAuthToken } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'citizen';
  
  const [userType, setUserType] = useState<'citizen' | 'ngo' | 'admin'>(defaultType as 'citizen' | 'ngo' | 'admin');
  const [isLogin, setIsLogin] = useState(true);
  const [rolePasscode, setRolePasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement)?.value;
    const password = (form.querySelector('#password') as HTMLInputElement)?.value;
    const fullName = (form.querySelector('#name') as HTMLInputElement)?.value;
    const organization = (form.querySelector('#organization') as HTMLInputElement)?.value;

    try {
      setIsSubmitting(true);
      if (isLogin) {
        if (userType === 'ngo') {
          const res = await apiPost<{ token: string; ngo: any }>("/api/ngo/auth/login", { email, password });
          setAuthToken(res.token);
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_email', email || '');
          localStorage.setItem('auth_role', 'ngo');
          localStorage.setItem('auth_name', res.ngo?.name || '');
          navigate('/ngo/dashboard');
        } else {
          const res = await apiPost<{ token: string; user: { role: string } }>("/api/auth/login", { email, password });
          setAuthToken(res.token);
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_email', email || '');
          localStorage.setItem('auth_role', res.user.role || 'citizen');
          const routes: Record<string, string> = { citizen: '/citizen/dashboard', ngo: '/citizen/dashboard', admin: '/admin/dashboard' };
          navigate(routes[res.user.role] || '/');
        }
      } else {
        // Require role passcode only for NGO/Admin at signup
        if ((userType === 'ngo' && rolePasscode !== 'NGO25') || (userType === 'admin' && rolePasscode !== 'ADMIN25')) {
          toast({ title: "Invalid role passcode", description: "Please enter the correct passcode for the selected role.", variant: "destructive" });
          return;
        }
        const payload: any = { fullName, email, password, role: userType, organization };
        if (userType === 'ngo' || userType === 'admin') payload.rolePasscode = rolePasscode;
        const res = await apiPost<{ token: string; user: { role: string } }>("/api/auth/signup", payload);
        setAuthToken(res.token);
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_email', email || '');
        localStorage.setItem('auth_role', res.user.role || 'citizen');
        const routes: Record<string, string> = { citizen: '/citizen/dashboard', ngo: '/citizen/dashboard', admin: '/admin/dashboard' };
        navigate(routes[res.user.role] || '/');
      }
    } catch (err: any) {
      toast({ title: 'Authentication failed', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
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
  const Icon = currentConfig.icon;

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
                <Icon className={`h-8 w-8 text-primary-foreground`} />
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
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Your full name" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isLogin ? 'Your password' : 'Min 6 characters'}
                      required
                    />
                    <Button type="button" variant="outline" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization (optional)</Label>
                    <Input id="organization" placeholder="Your organization or NGO name" />
                  </div>
                )}

                {!isLogin && (userType === 'ngo' || userType === 'admin') && (
                  <div className="space-y-2">
                    <Label htmlFor="role-passcode">Role Passcode</Label>
                    <Input
                      id="role-passcode"
                      placeholder={userType === 'admin' ? 'Enter ADMIN25' : 'Enter NGO25'}
                      value={rolePasscode}
                      onChange={(e) => setRolePasscode(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Only authorized {userType.toUpperCase()} users may proceed.</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </div>
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