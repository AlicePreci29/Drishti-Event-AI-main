
"use client"
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserSearch, Check, X, Siren, Loader2, Upload } from 'lucide-react';
import { runMatchFaces } from '@/app/actions';
import type { MatchFacesOutput } from '@/ai/flows/match-faces';
import type { Alert as AlertType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"];
const CONFIDENCE_THRESHOLD = 0.7;

export function FaceMatchTool({ 
    addAlert,
    getCameraFrame,
    hasCameraPermission
 }: { 
    addAlert: (alert: Omit<AlertType, 'id' | 'time' | 'action'>) => void;
    getCameraFrame: (cameraIndex: number) => string | null;
    hasCameraPermission: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MatchFacesOutput | null>(null);
  const { toast } = useToast();
  const [statusMessage, setStatusMessage] = useState('Awaiting photo upload.');

  const [missingPersonImg, setMissingPersonImg] = useState<string | null>(null);
  
  const missingPersonInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUri = reader.result as string;
        setMissingPersonImg(imageDataUri);
        handleAutomatedMatch(imageDataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutomatedMatch = async (missingPersonPhotoDataUri: string) => {
    if (!hasCameraPermission) {
      toast({
        variant: "destructive",
        title: "Camera Access Required",
        description: "Cannot start face match without camera permission.",
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    for (let i = 0; i < ZONES.length; i++) {
        setStatusMessage(`Scanning ${ZONES[i]}...`);
        const cctvFrameDataUri = getCameraFrame(i);

        if (!cctvFrameDataUri) {
            console.warn(`Skipping ${ZONES[i]} as frame could not be captured.`);
            continue; // Skip if camera is not ready
        }
        
        try {
            const matchResult = await runMatchFaces({
                missingPersonPhotoDataUri,
                cctvFootageDataUri: cctvFrameDataUri,
            });

            if (matchResult.matchFound && matchResult.confidenceScore >= CONFIDENCE_THRESHOLD) {
                setResult(matchResult);
                setStatusMessage(`Match found in ${matchResult.zone}!`);
                toast({
                    title: "Match Found!",
                    description: `A potential match was found in ${matchResult.zone}.`,
                });
                addAlert({
                    title: `Potential Missing Person Match`,
                    description: `A person matching the description was found in ${matchResult.zone} with ${Math.round(matchResult.confidenceScore * 100)}% confidence.`,
                    icon: Siren,
                    variant: 'destructive',
                });
                setIsLoading(false);
                return; // Stop searching once a confident match is found
            }
        } catch (error) {
            console.error(`Face matching failed for ${ZONES[i]}:`, error);
            toast({
                variant: "destructive",
                title: `Error Scanning ${ZONES[i]}`,
                description: "An error occurred during analysis.",
            });
        }
    }
    
    // If loop completes without finding a match
    setStatusMessage('No match found after scanning all zones.');
    setResult({ matchFound: false, zone: 'Unknown', confidenceScore: 0 });
    toast({
        title: "Scan Complete",
        description: "No match found in any of the zones.",
    });
    setIsLoading(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="missing-person">Missing Person Photo</Label>
                <div className="aspect-square w-full rounded-lg overflow-hidden relative bg-muted max-w-sm mx-auto">
                    {missingPersonImg ? 
                        <Image src={missingPersonImg} alt="Missing Person" layout="fill" objectFit="cover" data-ai-hint="portrait face" /> :
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Image will appear here</p>
                        </div>
                    }
                </div>
                <Button variant="outline" className="w-full" onClick={() => missingPersonInputRef.current?.click()} disabled={isLoading}>
                    <Upload className="mr-2 h-4 w-4"/>
                    {isLoading ? "Scanning..." : "Upload Photo & Start Scan"}
                </Button>
                <Input ref={missingPersonInputRef} id="missing-person" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><UserSearch className="w-5 h-5"/>Match Result</h3>
             {isLoading && (
              <div className="text-center py-10 border rounded-lg h-full flex items-center justify-center flex-col gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">{statusMessage}</p>
              </div>
            )}
            {!isLoading && result && (
              <Alert variant={result.matchFound ? 'destructive' : 'default'}>
                {result.matchFound ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <AlertTitle>{result.matchFound ? 'Potential Match Found' : 'No Match Found'}</AlertTitle>
                <AlertDescription>
                  {result.matchFound ? `Located in ${result.zone}.` : 'The person was not identified after scanning all zones.'}
                </AlertDescription>
                {result.matchFound && (
                  <div className="mt-4">
                    <Label className="text-sm">Confidence Score: {Math.round(result.confidenceScore * 100)}%</Label>
                    <Progress value={result.confidenceScore * 100} className="w-full mt-1" />
                  </div>
                )}
              </Alert>
            )}
             {!isLoading && !result && (
              <div className="text-center text-muted-foreground py-10 border rounded-lg h-full flex items-center justify-center">
                 <p>Upload a photo to begin the search.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
