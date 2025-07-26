"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Siren, Video, Camera, StopCircle, Loader2, Zap } from 'lucide-react';
import { runDetectAnomalies } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Alert as AlertType } from '@/lib/types';
import { DetectAnomaliesOutput } from '@/ai/flows/detect-anomalies';

const NUM_CAMERAS = 4;
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"];
const IP_CAMERA_URL = "http://192.168.137.219:8080"; // Mobile IP Webcam

function CameraFeed({
  cameraIndex,
  videoRef,
  hasCameraPermission,
  addAlert,
  updateZoneStatus,
  startAlarm,
  location,
}: {
  cameraIndex: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  hasCameraPermission: boolean;
  addAlert: (alert: Omit<AlertType, 'id' | 'time'>) => void;
  updateZoneStatus: (zoneIndex: number, result: DetectAnomaliesOutput | null, isLoading: boolean) => void;
  startAlarm: () => void;
  location: { latitude: number; longitude: number; } | null;
}) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const handleAnomalyDetection = async () => {
    const videoEl = videoRef.current;

    if (!videoEl || videoEl.readyState < 2) {
      toast({
        variant: "destructive",
        title: "Camera Not Ready",
        description: `Cannot scan ${ZONES[cameraIndex]} - video not accessible.`,
      });
      return;
    }

    setIsScanning(true);
    updateZoneStatus(cameraIndex, null, true);

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsScanning(false);
      updateZoneStatus(cameraIndex, null, false);
      return;
    }
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const frameDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await runDetectAnomalies({
        videoFeedDataUri: frameDataUri,
        location: location ?? undefined,
      });
      updateZoneStatus(cameraIndex, result, false);

      if (result.anomalyDetected && result.anomalyType !== "normal_walk") {
        startAlarm();
        const criticalAnomalies = ['panic_run', 'fall_detected', 'fight', 'entry_breach', 'object_abandon', 'overcrowd', 'hand_cover_face'];
        const isCritical = criticalAnomalies.includes(result.anomalyType);

        let alertAction;
        if (location) {
          alertAction = {
            label: 'View on Map',
            url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
          };
        }

        addAlert({
          title: `${ZONES[cameraIndex]}: ${result.anomalyType}`,
          description: result.description,
          icon: Siren,
          variant: isCritical ? 'destructive' : 'default',
          action: alertAction,
        });
      }
    } catch (error) {
      console.error(`Anomaly detection for ${ZONES[cameraIndex]} failed:`, error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: `Failed to analyze ${ZONES[cameraIndex]}.`,
      });
      updateZoneStatus(cameraIndex, null, false);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{ZONES[cameraIndex]}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between space-y-4">
        <div className="aspect-video w-full rounded-md overflow-hidden relative bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        </div>
        <Button onClick={handleAnomalyDetection} disabled={isScanning}>
          {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          {isScanning ? "Scanning..." : "Scan Zone"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function CctvPanel({
  addAlert,
  updateZoneStatus,
  videoRefs,
  hasCameraPermission,
  setHasCameraPermission,
  location,
}: {
  addAlert: (alert: Omit<AlertType, 'id' | 'time'>) => void;
  updateZoneStatus: (zoneIndex: number, result: DetectAnomaliesOutput | null, isLoading: boolean) => void;
  videoRefs: React.RefObject<HTMLVideoElement>[];
  hasCameraPermission: boolean;
  setHasCameraPermission: (value: boolean) => void;
  location: { latitude: number; longitude: number; } | null;
}) {
  const { toast } = useToast();
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioRef = useRef<{ audioContext: AudioContext | null, oscillator: OscillatorNode | null, gainNode: GainNode | null }>({
    audioContext: null,
    oscillator: null,
    gainNode: null
  });

  const handleEmergencyCall = () => {
    window.location.href = "tel:9597428005";
  };

  const startAlarm = () => {
    if (isAlarmPlaying) return;

    handleEmergencyCall();

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

      oscillator.start();

      audioRef.current = { audioContext, oscillator, gainNode };
      setIsAlarmPlaying(true);
    } catch (e) {
      console.error("Failed to play alarm sound:", e);
    }
  };

  const stopAlarm = () => {
    if (audioRef.current.audioContext && audioRef.current.oscillator) {
      audioRef.current.oscillator.stop();
      audioRef.current.audioContext.close().catch(console.error);
      audioRef.current = { audioContext: null, oscillator: null, gainNode: null };
      setIsAlarmPlaying(false);
    }
  };

  useEffect(() => {
    const setupCameras = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        videoRefs.forEach((ref, i) => {
          if (ref.current) {
            if (i === 0) {
              // Zone A uses laptop camera
              ref.current.srcObject = stream;
            } else if (i === 1) {
              // Zone B uses IP webcam from phone
              ref.current.src = IP_CAMERA_URL;
            } else {
              // Optional: Set blank or image source for others
              ref.current.poster = "http://192.168.137.219:8080/greet.html";
            }
          }
        });
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera access for Zone A in browser settings.",
        });
      }
    };

    setupCameras();
    return () => stopAlarm();
  }, [videoRefs, setHasCameraPermission, toast]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Live CCTV Feeds
          </div>
          {isAlarmPlaying && (
            <Button variant="destructive" onClick={stopAlarm}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Alarm
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoRefs.map((ref, i) => (
            <CameraFeed
              key={i}
              cameraIndex={i}
              videoRef={ref}
              hasCameraPermission={hasCameraPermission}
              addAlert={addAlert}
              updateZoneStatus={updateZoneStatus}
              startAlarm={startAlarm}
              location={location}
            />
          ))}
        </div>
        {!hasCameraPermission && (
          <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access in your browser for Zone A. Zone B pulls from your phone's IP Webcam.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}