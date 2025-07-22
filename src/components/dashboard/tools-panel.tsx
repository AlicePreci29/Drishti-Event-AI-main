
"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrowdDensityTool } from "./tools/crowd-density-tool";
import { FaceMatchTool } from "./tools/face-match-tool";
import { SafetySummaryTool } from "./tools/safety-summary-tool";
import { Alert } from "@/lib/types";
import { AnalyzeCrowdDensityOutput } from "@/ai/flows/analyze-crowd-density";


export function ToolsPanel({ 
  addAlert,
  getCameraFrame,
  hasCameraPermission,
  location,
  crowdDensityHistory,
  onAnalysisComplete
}: { 
  addAlert: (alert: Omit<Alert, 'id' | 'time'>) => void;
  getCameraFrame: (cameraIndex: number) => string | null;
  hasCameraPermission: boolean;
  location: { latitude: number, longitude: number } | null;
  crowdDensityHistory: any[];
  onAnalysisComplete: (result: AnalyzeCrowdDensityOutput) => void;
}) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Analysis Tools</CardTitle>
        <CardDescription>AI-powered tools for event monitoring and safety.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="crowd-density" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="crowd-density">Crowd Density</TabsTrigger>
            <TabsTrigger value="face-match">Face Match</TabsTrigger>
            <TabsTrigger value="safety-summary">Safety Summary</TabsTrigger>
          </TabsList>
          <div className="flex-grow mt-4">
            <TabsContent value="crowd-density" className="h-full">
              <CrowdDensityTool 
                addAlert={addAlert} 
                location={location}
                crowdDensityHistory={crowdDensityHistory}
                onAnalysisComplete={onAnalysisComplete}
              />
            </TabsContent>
            <TabsContent value="face-match" className="h-full">
              <FaceMatchTool 
                addAlert={addAlert} 
                getCameraFrame={getCameraFrame}
                hasCameraPermission={hasCameraPermission}
              />
            </TabsContent>
            <TabsContent value="safety-summary" className="h-full">
                <SafetySummaryTool />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
