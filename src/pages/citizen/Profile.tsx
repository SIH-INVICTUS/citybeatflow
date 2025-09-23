import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProfile, saveProfile, clearProfile, type UserProfile } from "@/lib/profileStorage";
import { apiGet, apiPost } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const emailFromAuth = localStorage.getItem('auth_email');
    const email = emailFromAuth || profile.email;
    if (!email) return;
    (async () => {
      setLoading(true);
      try {
        const serverProfile = await apiGet<UserProfile>(`/api/profile?email=${encodeURIComponent(email)}`);
        if (serverProfile) {
          setProfile(serverProfile);
          saveProfile(serverProfile);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const onSave = async () => {
    saveProfile(profile);
    try {
      await apiPost("/api/profile", profile);
    } catch {
      // Fallback already saved locally
    }
  };

  const onSignOut = () => {
    clearProfile();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_role');
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userType="citizen" userName={profile.fullName} />
      <div className="container py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <p className="text-sm text-muted-foreground">Loading profile…</p>
            )}
            {/* User details section */}
            <div className="flex items-center gap-4 pb-4">
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">{profile.fullName ? profile.fullName[0] : "U"}</span>
              </div>
              <div>
                <div className="font-semibold text-lg">{profile.fullName || "User"}</div>
                <div className="text-sm text-muted-foreground">{profile.email}</div>
              </div>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Your full name" value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={profile.email} onChange={(e) => update("email", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="e.g. +91 98765 43210" value={profile.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={profile.gender} onValueChange={(v) => update("gender", v as UserProfile["gender"]) }>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Prefer not to say</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={profile.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="mt-1" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="civic" onClick={onSave} className="flex-1">Save</Button>
              <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Back</Button>
            </div>
            <div className="pt-2">
              <Button variant="destructive" onClick={onSignOut} className="w-full">Log Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;


