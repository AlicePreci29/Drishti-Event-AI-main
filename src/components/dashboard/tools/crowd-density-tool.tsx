// src/components/dashboard/tools/crowd-density-tool.tsx
"use client"
import * as React from 'react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Siren, Loader2, Upload, MapPin, TrendingUp, BarChart3 } from 'lucide-react';
import { runAnalyzeCrowdDensity } from '@/app/actions';
import type { AnalyzeCrowdDensityOutput } from '@/ai/flows/analyze-crowd-density';
import type { Alert as AlertType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ResponsiveContainer, Legend } from 'recharts';

export function CrowdDensityTool({ 
  addAlert, 
  location, 
  crowdDensityHistory,
  onAnalysisComplete 
}: { 
  addAlert: (alert: Omit<AlertType, 'id' | 'time'>) => void; 
  location: { latitude: number, longitude: number } | null;
  crowdDensityHistory: any[];
  onAnalysisComplete: (result: AnalyzeCrowdDensityOutput) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeCrowdDensityOutput | null>(null);
  const [image, setImage] = useState<string | null>("https://placehold.co/1280x720.png");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
    if (!image) {
       toast({
        variant: "destructive",
        title: "No Image",
        description: "Please upload an image to analyze.",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await runAnalyzeCrowdDensity({ 
        photoDataUri: image,
        location: location ?? undefined,
      });
      setResult(analysisResult);
      onAnalysisComplete(analysisResult);
      
      toast({
        title: "Analysis Complete",
        description: "Crowd density analysis has been updated.",
      });

      const bottleneck = analysisResult.densityAnalysis.find(zone => zone.bottleneckRisk);
      if (bottleneck) {
        let description = `High crowd density poses a bottleneck risk in ${bottleneck.zone}.`;
        
        let alertAction;
        if (location) {
          description += ` Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}.`;
          alertAction = {
              label: 'View on Map',
              url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
          }
        }
        
        addAlert({
          title: `Bottleneck Risk: ${bottleneck.zone}`,
          description,
          icon: Siren,
          variant: 'destructive',
          action: alertAction,
        });
      }
    } catch (error) {
      console.error("Crowd density analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform crowd density analysis.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBadgeVariant = (density: 'Low' | 'Medium' | 'High') => {
    switch (density) {
      case 'Low': return 'default';
      case 'Medium': return 'secondary';
      case 'High': return 'destructive';
      default: return 'outline';
    }
  };

  const getZoneColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return colors[index % colors.length];
  }

  const chartZones = React.useMemo(() => {
    if (!crowdDensityHistory || crowdDensityHistory.length === 0) return [];
    // Get all unique zone names from the history
    const allZones = new Set<string>();
    crowdDensityHistory.forEach(dataPoint => {
      Object.keys(dataPoint).forEach(key => {
        if (key !== 'time') {
          allZones.add(key);
        }
      });
    });
    return Array.from(allZones);
  }, [crowdDensityHistory]);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Tabs defaultValue="original" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="original">Original Image</TabsTrigger>
                  <TabsTrigger value="heatmap" disabled={!result?.heatmapDataUri}>Heatmap</TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-4">
                  <div className="aspect-video w-full rounded-lg overflow-hidden relative bg-muted">
                    {image && <Image src={image} alt="CCTV for Density Analysis" layout="fill" objectFit="cover" data-ai-hint="cctv crowd" />}
                  </div>
                </TabsContent>
                <TabsContent value="heatmap" className="mt-4">
                   <div className="aspect-video w-full rounded-lg overflow-hidden relative bg-muted">
                    {result?.heatmapDataUri ? (
                        <Image src={result.heatmapDataUri} alt="Crowd Density Heatmap" layout="fill" objectFit="cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Heatmap will be shown here after analysis.</p>
                        </div>
                      )}
                  </div>
                </TabsContent>
              </Tabs>
              
               <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <Button onClick={handleAnalysis} disabled={isLoading || !image} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Analyzing...' : 'Analyze Crowd Density'}
                  </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Users className="w-5 h-5" /> Analysis Results</h3>
              {result ? (
                <div className="space-y-4">
                  {result.overallAssessment && (
                    <Alert>
                      <AlertTitle>Overall Assessment</AlertTitle>
                      <AlertDescription>{result.overallAssessment}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    {result.densityAnalysis.map((zone) => (
                      <div key={zone.zone} className="flex justify-between items-center p-2 rounded-md border">
                        <span className="font-medium">{zone.zone}</span>
                        <div className="flex items-center gap-2">
                          {zone.bottleneckRisk && <Badge variant="outline" className="border-destructive text-destructive">Bottleneck</Badge>}
                          <Badge variant={getBadgeVariant(zone.density)}>{zone.density}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10 border rounded-lg h-full flex items-center justify-center">
                  <div>
                    <p>No analysis yet.</p>
                    <p className="text-sm">Upload an image and click the button to start.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Crowd Density Trends</h3>
            {crowdDensityHistory.length > 0 ? (
              <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Density Over Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={crowdDensityHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis tickFormatter={(value) => {
                          if (value === 1) return 'Low';
                          if (value === 2) return 'Medium';
                          if (value === 3) return 'High';
                          return '';
                        }} domain={[0.5, 3.5]} ticks={[1, 2, 3]} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend />
                        {chartZones.map((zone, index) => (
                          <Line key={zone} type="monotone" dataKey={zone} name={zone} stroke={getZoneColor(index)} dot={false} strokeWidth={2} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground py-10 border rounded-lg">
                <p>No historical data yet.</p>
                <p className="text-sm">Perform an analysis to see trends.</p>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
