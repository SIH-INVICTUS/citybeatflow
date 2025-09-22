import { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProfile, saveProfile, clearProfile, type UserProfile } from "@/lib/profileStorage";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getProfile());

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const onSave = () => {
    saveProfile(profile);
  };

  const onSignOut = () => {
    clearProfile();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userType="citizen" />
      <div className="container py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={profile.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={profile.gender} onValueChange={(v) => update("gender", v as UserProfile["gender"])}>
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
              <Button variant="destructive" onClick={onSignOut} className="w-full">Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;


