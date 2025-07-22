
import type { LucideIcon } from "lucide-react";

export interface Alert {
  id: number;
  time: string;
  title: string;
  description: string;
  icon: LucideIcon;
  variant: "default" | "destructive";
  action?: {
    label: string;
    url: string;
  }
}
