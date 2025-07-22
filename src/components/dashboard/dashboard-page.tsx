
"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './header';
import { CctvPanel } from './cctv-panel';
import { ZoneStatusPanel } from './zone-status-panel';
import { AlertsPanel, type Alert } from './alerts-panel';
import { ToolsPanel } from './tools-panel';
import { Chatbot } from './chatbot';
import type { DetectAnomaliesOutput } from '@/ai/flows/detect-anomalies';
import type { AnalyzeCrowdDensityOutput } from '@/ai/flows/analyze-crowd-density';
import { useToast } from '@/hooks/use-toast';

export interface ZoneStatus {
  zone: string;
  status: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Normal' | null;
  anomaly: string;
  description: string;
}

const initialZones: ZoneStatus[] = [
  { zone: 'Zone A', status: 'Monitoring...', riskLevel: 'Normal', anomaly: 'None', description: 'No issues detected.' },
  { zone: 'Zone B', status: 'Monitoring...', riskLevel: 'Normal', anomaly: 'None', description: 'No issues detected.' },
  { zone: 'Zone C', status: 'Monitoring...', riskLevel: 'Normal', anomaly: 'None', description: 'No issues detected.' },
  { zone: 'Zone D', status: 'Monitoring...', riskLevel: 'Normal', anomaly: 'None', description: 'No issues detected.' },
];

const NUM_CAMERAS = 4;

export function DashboardPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [zoneStatuses, setZoneStatuses] = useState<ZoneStatus[]>(initialZones);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [crowdDensityHistory, setCrowdDensityHistory] = useState<any[]>([]);
  const videoRefs = Array.from({ length: NUM_CAMERAS }, () => useRef<HTMLVideoElement>(null));
  const { toast } = useToast();

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('authenticated');
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setIsClient(true);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              variant: 'destructive',
              title: 'Location Error',
              description: 'Could not retrieve your location. Location-based features will be limited.',
            });
          }
        );
      }
    }
  }, [router, toast]);

  const getCameraFrame = (cameraIndex: number): string | null => {
      const video = videoRefs[cameraIndex].current;
      if (!video || video.readyState < 2) {
          toast({
              variant: "destructive",
              title: "Camera Not Ready",
              description: "The selected camera is not available to capture a frame.",
          });
          return null;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg');
  };

  const addAlert = (newAlert: Omit<Alert, 'id' | 'time'>) => {
    setAlerts(prevAlerts => [
      { ...newAlert, id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      ...prevAlerts
    ].slice(0, 50)); // Keep last 50 alerts
  };

  const addCrowdDensityData = (newAnalysis: AnalyzeCrowdDensityOutput) => {
    const densityToValue: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const newDataPoint: {[key: string]: any} = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    
    newAnalysis.densityAnalysis.forEach(item => {
      newDataPoint[item.zone] = densityToValue[item.density];
    });

    setCrowdDensityHistory(prevHistory => [...prevHistory, newDataPoint].slice(-20)); // Keep last 20 points
  };
  
  const updateZoneStatus = (zoneIndex: number, result: DetectAnomaliesOutput | null, isLoading: boolean) => {
    setZoneStatuses(prevStatuses => {
      const newStatuses = [...prevStatuses];
      const status = newStatuses[zoneIndex];
      
      if(isLoading) {
        status.status = "Scanning...";
        status.anomaly = '...';
        status.riskLevel = null;
        status.description = '...';
      } else if (result) {
        status.status = result.anomalyDetected ? "Anomaly Detected" : "Normal";
        status.anomaly = result.anomalyDetected ? result.anomalyType : "None";
        status.riskLevel = result.anomalyDetected ? result.riskLevel : "Normal";
        status.description = result.description;
      } else {
         status.status = "Monitoring...";
         status.anomaly = 'None';
         status.riskLevel = 'Normal';
         status.description = 'No issues detected.';
      }
      
      return newStatuses;
    });
  };

  if (!isClient) {
    return null; // Render nothing on the server or if not authenticated
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 h-full">
          <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
             <CctvPanel 
                addAlert={addAlert} 
                updateZoneStatus={updateZoneStatus} 
                videoRefs={videoRefs}
                hasCameraPermission={hasCameraPermission}
                setHasCameraPermission={setHasCameraPermission}
                location={location}
             />
             <ZoneStatusPanel zoneStatuses={zoneStatuses} />
             <ToolsPanel 
                addAlert={addAlert} 
                getCameraFrame={getCameraFrame}
                hasCameraPermission={hasCameraPermission}
                location={location}
                crowdDensityHistory={crowdDensityHistory}
                onAnalysisComplete={addCrowdDensityData}
              />
          </div>
          <div className="lg:col-span-12 xl:col-span-4">
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}
