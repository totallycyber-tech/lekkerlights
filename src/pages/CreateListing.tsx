import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { provinces } from "@/data/mockListings";
import { Sparkles, ArrowLeft, Check, Youtube, Image, Plus, X, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CreateListing() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['']);
  const [googleDriveUrls, setGoogleDriveUrls] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    streetNumber: '',
    streetName: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    operatingDays: '',
    operatingTimes: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addYoutubeUrl = () => {
    if (youtubeUrls.length < 3) {
      setYoutubeUrls([...youtubeUrls, '']);
    }
  };

  const removeYoutubeUrl = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const updateYoutubeUrl = (index: number, value: string) => {
    const updated = [...youtubeUrls];
    updated[index] = value;
    setYoutubeUrls(updated);
  };

  const addGoogleDriveUrl = () => {
    if (googleDriveUrls.length < 10) {
      setGoogleDriveUrls([...googleDriveUrls, '']);
    }
  };

  const removeGoogleDriveUrl = (index: number) => {
    setGoogleDriveUrls(googleDriveUrls.filter((_, i) => i !== index));
  };

  const updateGoogleDriveUrl = (index: number, value: string) => {
    const updated = [...googleDriveUrls];
    updated[index] = value;
    setGoogleDriveUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Listing submitted!",
      description: "Your Christmas display will be reviewed and published soon.",
    });

    setIsSubmitting(false);
    navigate('/browse');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8 space-y-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-christmas" />
                <span className="text-sm font-medium text-christmas uppercase tracking-wider">
                  Share Your Display
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                List Your Christmas Display
              </h1>
              <p className="text-muted-foreground">
                Share your Christmas decorations with your community and help spread the festive joy!
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Basic Information</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Display Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Winter Wonderland Display"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell visitors what makes your Christmas display special..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="bg-secondary min-h-[120px]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Location</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">Street Number *</Label>
                    <Input
                      id="streetNumber"
                      placeholder="42"
                      value={formData.streetNumber}
                      onChange={(e) => handleChange('streetNumber', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="streetName">Street Name *</Label>
                    <Input
                      id="streetName"
                      placeholder="Jacaranda Avenue"
                      value={formData.streetName}
                      onChange={(e) => handleChange('streetName', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input
                      id="suburb"
                      placeholder="Sandton"
                      value={formData.suburb}
                      onChange={(e) => handleChange('suburb', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Johannesburg"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Select 
                      value={formData.province}
                      onValueChange={(value) => handleChange('province', value)}
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="2196"
                      value={formData.postalCode}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Videos */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Photos & Videos</h2>
                
                <div className="space-y-6">
                  {/* Google Drive Import */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="h-5 w-5 text-festive-cyan" />
                        <Label className="text-sm font-medium">Import from Google Drive</Label>
                      </div>
                      {googleDriveUrls.length < 10 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addGoogleDriveUrl}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add More
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paste shareable Google Drive image links (up to 10)
                    </p>
                    {googleDriveUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="https://drive.google.com/file/d/..."
                            value={url}
                            onChange={(e) => updateGoogleDriveUrl(index, e.target.value)}
                            className="bg-secondary pl-10"
                          />
                        </div>
                        {googleDriveUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGoogleDriveUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* YouTube URLs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-destructive" />
                        <Label className="text-sm font-medium">YouTube Videos</Label>
                      </div>
                      {youtubeUrls.length < 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addYoutubeUrl}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add More
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add YouTube video URLs to showcase your display (up to 3)
                    </p>
                    {youtubeUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                            className="bg-secondary pl-10"
                          />
                        </div>
                        {youtubeUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeYoutubeUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="font-display text-lg font-semibold">Operating Hours</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operatingDays">Days *</Label>
                    <Input
                      id="operatingDays"
                      placeholder="e.g., Daily from 1 Dec - 6 Jan"
                      value={formData.operatingDays}
                      onChange={(e) => handleChange('operatingDays', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operatingTimes">Times *</Label>
                    <Input
                      id="operatingTimes"
                      placeholder="e.g., 7:00 PM - 11:00 PM"
                      value={formData.operatingTimes}
                      onChange={(e) => handleChange('operatingTimes', e.target.value)}
                      className="bg-secondary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Contact Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Optional - only if you want visitors to contact you</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+27 82 123 4567"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      className="bg-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Your listing will be reviewed by our team before going live. 
                This usually takes 1-2 business days.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
