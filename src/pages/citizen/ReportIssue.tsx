import { useState, useRef } from "react";
import { ArrowLeft, Camera, MapPin, Upload, AlertTriangle, Lightbulb, Construction, TreePine, Car, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { addNewIssue } from "@/lib/issuesStorage";

const ReportIssue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    urgency: "medium",
    photos: [] as File[]
  });

  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const categories = [
    { id: "potholes", label: "Potholes & Road Damage", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
    { id: "streetlights", label: "Broken Street Lights", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700" },
    { id: "construction", label: "Construction Issues", icon: Construction, color: "bg-orange-100 text-orange-700" },
    { id: "parks", label: "Parks & Green Spaces", icon: TreePine, color: "bg-green-100 text-green-700" },
    { id: "parking", label: "Parking Problems", icon: Car, color: "bg-blue-100 text-blue-700" },
    { id: "waste", label: "Waste Management", icon: Home, color: "bg-purple-100 text-purple-700" },
    { id: "utilities", label: "Utilities", icon: Zap, color: "bg-indigo-100 text-indigo-700" }
  ];

  const urgencyLevels = [
    { value: "low", label: "Low - Can wait", color: "bg-green-50 border-green-200 text-green-800" },
    { value: "medium", label: "Medium - Normal priority", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
    { value: "high", label: "High - Needs quick attention", color: "bg-red-50 border-red-200 text-red-800" }
  ];

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setFormData(prev => ({ 
          ...prev, 
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
        }));
        setIsGettingLocation(false);
        toast({
          title: "Location captured",
          description: "Your current location has been added to the report.",
        });
      },
      (error) => {
        console.error("Location error:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please enter manually.",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoCapture = async () => {
    try {
      // For mobile devices with camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Use back camera
        });
        
        // Create a video element to show camera preview
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // For now, fall back to file input
        stream.getTracks().forEach(track => track.stop());
        fileInputRef.current?.click();
        
        toast({
          title: "Camera Access",
          description: "Camera functionality will be enhanced in the mobile app version.",
        });
      } else {
        // Fallback to file input
        fileInputRef.current?.click();
      }
    } catch (error) {
      console.error("Camera access error:", error);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        photos: [...prev.photos, ...files].slice(0, 5) // Max 5 photos
      }));
      toast({
        title: "Photos added",
        description: `${files.length} photo(s) added to your report.`,
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Save locally so it shows in My Reports and Map
    addNewIssue({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      locationText: formData.location,
      locationCoords: currentLocation,
      urgency: formData.urgency as any,
    });
    
    toast({
      title: "Report Submitted",
      description: "Your civic issue report has been submitted successfully!",
    });

    // Navigate back to dashboard
    navigate('/citizen/dashboard');
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className="min-h-screen bg-background">
      <Header userType="citizen" />
      
      <div className="container py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/citizen/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Report Civic Issue</h1>
            <p className="text-muted-foreground">Help improve your community by reporting issues that need attention.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Issue Category *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.category === category.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <category.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Title and Description */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder={selectedCategory ? `${selectedCategory.label} - Brief description` : "Brief description of the issue"}
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about the issue, its location, and any safety concerns..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border ${level.color}`}></div>
                            {level.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo Evidence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePhotoCapture}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photos
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.photos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Photos ({formData.photos.length}/5)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            <img 
                              src={URL.createObjectURL(photo)} 
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                            onClick={() => removePhoto(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    {isGettingLocation ? "Getting Location..." : "Use Current Location"}
                  </Button>
                </div>

                <div>
                  <Label htmlFor="location">Address or Coordinates</Label>
                  <Input
                    id="location"
                    placeholder="Enter address or coordinates"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {currentLocation && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/citizen/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="hero" 
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;