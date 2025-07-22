"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, FileText, Loader2 } from 'lucide-react';
import { runSummarizeSafetyRisks } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';

export function SafetySummaryTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const { toast } = useToast();

  const [securityAlerts, setSecurityAlerts] = useState("Minor altercation reported near stage left. Unattended bag found at Gate B.");
  const [crowdData, setCrowdData] = useState("High density reported in Zone 3, moderate but increasing flow towards exits.");
  const [socialMedia, setSocialMedia] = useState("Increased mentions of 'overcrowding' and 'long queues' related to the event on Twitter.");

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary('');
    try {
      const result = await runSummarizeSafetyRisks({
        zone: "Main Event Area",
        securityAlerts,
        crowdSensorData: crowdData,
        socialMediaTrends: socialMedia,
      });
      setSummary(result.summary);
      toast({
        title: "Summary Generated",
        description: "Safety risk summary is now available.",
      });
    } catch (error) {
      console.error("Safety summary generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate safety summary.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="security-alerts">Security Alerts</Label>
              <Textarea id="security-alerts" value={securityAlerts} onChange={(e) => setSecurityAlerts(e.target.value)} placeholder="e.g., Minor altercation reported..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crowd-data">Crowd Sensor Data</Label>
              <Textarea id="crowd-data" value={crowdData} onChange={(e) => setCrowdData(e.target.value)} placeholder="e.g., High density in Zone 3..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social-media">Social Media Trends</Label>
              <Textarea id="social-media" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} placeholder="e.g., Mentions of overcrowding..." />
            </div>
            <Button onClick={handleSummarize} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              {isLoading ? 'Generating...' : 'Generate Safety Summary'}
            </Button>
          </div>

          <div className="space-y-4">
             <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Generated Summary</h3>
            {summary ? (
              <Alert>
                <AlertTitle>Top Safety Risks</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">{summary}</AlertDescription>
              </Alert>
            ) : (
               <div className="text-center text-muted-foreground py-10 border rounded-lg h-full flex items-center justify-center">
                <p>Summary will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
