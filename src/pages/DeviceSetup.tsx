import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Bluetooth, Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Device {
  id: string;
  device_name: string;
  device_type: string;
  is_connected: boolean;
  last_sync: string | null;
}

export default function DeviceSetup() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const scanForDevices = async () => {
    setScanning(true);
    toast.info("Scanning for Bluetooth devices...");

    // Simulate device scanning
    setTimeout(() => {
      const mockDevice: Device = {
        id: Math.random().toString(36).substr(2, 9),
        device_name: "Digital Thermometer #" + Math.floor(Math.random() * 1000),
        device_type: "thermometer",
        is_connected: false,
        last_sync: null,
      };

      setDevices((prev) => [...prev, mockDevice]);
      toast.success("Device found!");
      setScanning(false);
    }, 2000);
  };

  const connectDevice = async (deviceId: string) => {
    setConnecting(deviceId);
    toast.info("Connecting to device...");

    // Simulate connection
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? { ...d, is_connected: true, last_sync: new Date().toISOString() }
            : d
        )
      );
      toast.success("Device connected successfully!");
      setConnecting(null);
    }, 1500);
  };

  const syncDevice = async (deviceId: string) => {
    toast.info("Syncing device data...");

    // Simulate data sync
    setTimeout(() => {
      const mockTemp = 98.6 + (Math.random() * 3 - 1.5);

      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId ? { ...d, last_sync: new Date().toISOString() } : d
        )
      );

      toast.success(`Synced: ${mockTemp.toFixed(1)}°F`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/patient")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bluetooth className="h-5 w-5" />
              IoT Device Setup
            </CardTitle>
            <CardDescription>
              Connect your Bluetooth thermometer for automatic temperature
              tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={scanForDevices}
              disabled={scanning}
              className="w-full gap-2"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Bluetooth className="h-4 w-4" />
                  Scan for Devices
                </>
              )}
            </Button>

            <div className="space-y-3">
              {devices.map((device) => (
                <Card key={device.id} className="animate-slide-up hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{device.device_name}</p>
                          {device.is_connected && (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {device.last_sync
                            ? `Last sync: ${new Date(
                                device.last_sync
                              ).toLocaleString()}`
                            : "Never synced"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!device.is_connected ? (
                          <Button
                            size="sm"
                            onClick={() => connectDevice(device.id)}
                            disabled={connecting === device.id}
                          >
                            {connecting === device.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Connect"
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncDevice(device.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {devices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bluetooth className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>
                    No devices found. Click "Scan for Devices" to get started.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
