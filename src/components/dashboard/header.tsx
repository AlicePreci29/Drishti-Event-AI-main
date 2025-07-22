"use client"
import { Button } from "@/components/ui/button";
import { Phone, Shield } from "lucide-react";

export function Header() {
  const handleEmergencyCall = () => {
    window.location.href = "tel:9597428005";
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Drishti Event AI</h1>
      </div>
      <Button
        variant="destructive"
        className="animate-pulse hover:animate-none"
        onClick={handleEmergencyCall}
      >
        <Phone className="mr-2 h-4 w-4" />
        Emergency
      </Button>
    </header>
  );
}
