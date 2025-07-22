
import { Bell, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert as AlertUI } from '@/components/ui/alert';
import type { Alert } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export type { Alert };

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5" />
          Alerts
        </CardTitle>
        <CardDescription>Real-time security and operational alerts.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4 -mr-4">
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <AlertUI key={alert.id} variant={alert.variant} className="flex items-start gap-4">
                    <Icon className={cn("h-5 w-5 mt-1 shrink-0", alert.variant === "destructive" ? "text-destructive" : "text-primary")} />
                    <div className="grid gap-1 flex-grow">
                      <p className={cn("font-semibold")}>
                        {alert.title}
                      </p>
                      <p className={cn("text-sm text-muted-foreground")}>
                        {alert.description}
                      </p>
                       <p className={cn("text-xs text-muted-foreground/80")}>
                        {alert.time}
                      </p>
                      {alert.action && (
                        <Button 
                            variant="outline"
                            size="sm"
                            className="mt-2 justify-start w-fit"
                            onClick={() => window.open(alert.action?.url, '_blank')}>
                            <Map className="mr-2 h-4 w-4" />
                            {alert.action.label}
                        </Button>
                      )}
                    </div>
                  </AlertUI>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No alerts yet.</p>
                <p className="text-sm">System is monitoring.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
