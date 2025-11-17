import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Alert {
  id: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
  patientId?: string;
}

interface RealTimeAlertsProps {
  onAlertCountChange?: (count: number) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7777"

export function RealTimeAlertss({ onAlertCountChange }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/clinician/alerts?status=unread`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setAlerts(response.data.alerts);
        if (onAlertCountChange) {
          onAlertCountChange(response.data.alerts.length);
        }
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/clinician/alerts/${alertId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success("Alert marked as read");

      if (onAlertCountChange) {
        onAlertCountChange(alerts.length - 1);
      }
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="mt-8 p-6 border-2 border-border animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Real-Time Alerts
        </h2>
        <Badge variant="destructive">{alerts.length}</Badge>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No alerts at this time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 border rounded-lg flex items-start justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(alert.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
