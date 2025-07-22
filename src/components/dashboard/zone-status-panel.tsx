
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import type { ZoneStatus } from "./dashboard-page";

export function ZoneStatusPanel({ zoneStatuses }: { zoneStatuses: ZoneStatus[] }) {

  const getRiskBadgeVariant = (riskLevel: 'Low' | 'Medium' | 'High' | 'Normal' | null) => {
    if (!riskLevel) return 'outline';
    switch (riskLevel) {
      case 'Normal': return 'default';
      case 'Low': return 'secondary';
      case 'Medium': return 'secondary';
      case 'High': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="w-5 h-5" />
          Zone Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Anomaly</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zoneStatuses.map((zone) => (
              <TableRow key={zone.zone}>
                <TableCell className="font-medium">{zone.zone}</TableCell>
                <TableCell>{zone.status}</TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(zone.riskLevel)}>
                    {zone.riskLevel ?? 'Scanning...'}
                  </Badge>
                </TableCell>
                <TableCell>{zone.anomaly}</TableCell>
                <TableCell>{zone.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
