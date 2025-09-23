import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile, clearProfile } from "@/lib/profileStorage";

interface HeaderProps {
  userType?: 'citizen' | 'ngo' | 'admin' | null;
  onMenuClick?: () => void;
  userName?: string;
}

const Header = ({ userType, onMenuClick, userName }: HeaderProps) => {
  const navigate = useNavigate();
  const [derivedRole, setDerivedRole] = useState<string | null>(null);
  const [derivedName, setDerivedName] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('auth_role');
    const profile = getProfile();
    const name = profile?.fullName || localStorage.getItem('auth_name');
    setDerivedRole(role);
    setDerivedName(name || null);
  }, []);

  const doSignOut = () => {
    clearProfile();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_name');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {userType && onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">CivicTracker</h1>
              <p className="text-xs text-muted-foreground">Building Better Communities</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userType || derivedRole ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate((userType || derivedRole) === 'admin' ? '/admin/dashboard' : (userType || derivedRole) === 'ngo' ? '/ngo/dashboard' : '/citizen/dashboard')}>
                  <User className="h-5 w-5" />
                </Button>
                {/* Show username beside user logo */}
                <span className="font-semibold text-foreground text-sm">{userName || derivedName || "User"}</span>
                <Button variant="ghost" size="sm" onClick={doSignOut} className="ml-2">
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                variant="civic" 
                onClick={() => navigate('/auth')}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;