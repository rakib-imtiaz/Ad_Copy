'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Save, 
  Upload, 
  Volume2, 
  Type, 
  Camera, 
  FileImage, 
  RefreshCw, 
  Check,
  X,
  Eye,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const initialBrandColors = [
  { id: 'primary', name: 'Primary', color: '#4F46E5', description: 'Main brand color' },
  { id: 'secondary', name: 'Secondary', color: '#10B981', description: 'Accent color' },
  { id: 'neutral', name: 'Neutral', color: '#6B7280', description: 'Text and borders' },
  { id: 'background', name: 'Background', color: '#F9FAFB', description: 'Page backgrounds' },
  { id: 'success', name: 'Success', color: '#22C55E', description: 'Success states' },
  { id: 'warning', name: 'Warning', color: '#F59E0B', description: 'Warning states' },
];

const voiceToneOptions = [
  { id: 'professional', name: 'Professional', description: 'Formal and business-like' },
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
  { id: 'casual', name: 'Casual', description: 'Relaxed and informal' },
  { id: 'authoritative', name: 'Authoritative', description: 'Confident and expert' },
  { id: 'playful', name: 'Playful', description: 'Fun and energetic' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean and concise' },
];

const fontOptions = [
  { value: 'inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'roboto', label: 'Roboto', category: 'Sans-serif' },
  { value: 'open-sans', label: 'Open Sans', category: 'Sans-serif' },
  { value: 'lato', label: 'Lato', category: 'Sans-serif' },
  { value: 'poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'playfair', label: 'Playfair Display', category: 'Serif' },
  { value: 'fira-code', label: 'Fira Code', category: 'Monospace' },
];

const BrandingPage = () => {
  const [brandColors, setBrandColors] = useState(initialBrandColors);
  const [selectedVoiceTone, setSelectedVoiceTone] = useState('professional');
  const [headingFont, setHeadingFont] = useState('inter');
  const [bodyFont, setBodyFont] = useState('inter');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateColor = (colorId: string, newColor: string) => {
    setBrandColors(prev => 
      prev.map(color => 
        color.id === colorId ? { ...color, color: newColor } : color
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setHasChanges(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
          <h1 className="text-3xl font-bold tracking-tight">Brand Customization</h1>
          <p className="text-muted-foreground mt-1">
            Customize your brand appearance, voice, and visual identity
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          {hasChanges && (
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Eye size={16} />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-2"
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Branding Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">Colors & Theme</TabsTrigger>
            <TabsTrigger value="assets">Brand Assets</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="voice">Voice & Tone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Brand Colors
                </CardTitle>
                <CardDescription>
                  Define your brand's color palette for consistent visual identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brandColors.map((color, index) => (
              <motion.div
                      key={color.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group p-4 border rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: color.color }}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = color.color;
                            input.onchange = (e) => updateColor(color.id, (e.target as HTMLInputElement).value);
                            input.click();
                          }}
                        >
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Palette className="h-4 w-4 text-white" />
                          </div>
                        </div>
                <div className="flex-1">
                          <h3 className="font-medium">{color.name}</h3>
                          <p className="text-sm text-muted-foreground">{color.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {color.color}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(color.color)}
                        >
                          Copy
                        </Button>
                </div>
              </motion.div>
            ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Brand Assets
                </CardTitle>
                <CardDescription>
                  Upload and manage your brand's visual assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Logo</h3>
                      <p className="text-sm text-muted-foreground mb-4">PNG, JPG, SVG up to 2MB</p>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
          </div>
        </motion.div>

                  {/* Favicon Upload */}
        <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                      <div className="w-12 h-12 bg-muted rounded mx-auto mb-4 flex items-center justify-center">
                        <FileImage className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2">Favicon</h3>
                      <p className="text-sm text-muted-foreground mb-4">ICO, PNG 32x32px up to 1MB</p>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  </motion.div>
          </div>
          
                {/* Asset Guidelines */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Asset Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Logo: Use high-resolution images for better quality</li>
                    <li>• Favicon: Should be simple and recognizable at small sizes</li>
                    <li>• Supported formats: PNG, JPG, SVG, ICO</li>
                    <li>• Maximum file size: 2MB for logo, 1MB for favicon</li>
                  </ul>
            </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Typography Settings
                </CardTitle>
                <CardDescription>
                  Configure fonts for headings, body text, and other elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <label className="text-sm font-medium">Heading Font</label>
                    <Select value={headingFont} onValueChange={(value) => { setHeadingFont(value); setHasChanges(true); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select heading font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{font.label}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {font.category}
                              </Badge>
            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-2xl font-bold" style={{ fontFamily: headingFont }}>
                      Sample Heading Text
          </div>
        </motion.div>

        <motion.div 
                    initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-3"
                  >
                    <label className="text-sm font-medium">Body Font</label>
                    <Select value={bodyFont} onValueChange={(value) => { setBodyFont(value); setHasChanges(true); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select body font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{font.label}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {font.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm" style={{ fontFamily: bodyFont }}>
                      This is sample body text that shows how your content will look with the selected font. Choose wisely for better readability.
                    </div>
                  </motion.div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Font Preview</h4>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold" style={{ fontFamily: headingFont }}>
                      Main Heading
                    </h1>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: headingFont }}>
                      Subheading Example
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ fontFamily: bodyFont }}>
                      This paragraph demonstrates how your body text will appear with the selected fonts. 
                      The typography choices significantly impact the overall feel and readability of your brand.
                    </p>
                  </div>
          </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice & Tone
                </CardTitle>
                <CardDescription>
                  Define your brand's personality and communication style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium">Select your brand voice</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {voiceToneOptions.map((tone, index) => (
              <motion.div
                        key={tone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all",
                          selectedVoiceTone === tone.id 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => { setSelectedVoiceTone(tone.id); setHasChanges(true); }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={cn(
                            "font-medium",
                            selectedVoiceTone === tone.id ? 'text-primary' : ''
                          )}>
                      {tone.name}
                    </h3>
                          {selectedVoiceTone === tone.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{tone.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Brand messaging guidelines</label>
                  <Textarea
                    placeholder="Describe your brand's communication style, key messages, and guidelines for tone..."
                    className="min-h-24"
                    onChange={() => setHasChanges(true)}
                  />
          </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Voice & Tone Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    Your selected voice ({voiceToneOptions.find(t => t.id === selectedVoiceTone)?.name}) will influence:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• AI-generated content tone and style</li>
                    <li>• User interface copy and messaging</li>
                    <li>• Email templates and notifications</li>
                    <li>• Help documentation and support responses</li>
                  </ul>
              </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
  );
};

export default BrandingPage;
