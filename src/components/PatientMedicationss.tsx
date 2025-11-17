import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pill, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Medication {
  _id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

interface MedicationLog {
  _id: string;
  medicationId: string;
  takenAt: string;
  status: "taken" | "missed" | "skipped";
  notes: string | null;
  sideEffects: string[];
}

interface PatientMedicationsProps {
  medications?: Medication[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7777"

export const PatientMedicationss = ({
  medications: propMedications,
}: PatientMedicationsProps) => {
  const [medications, setMedications] = useState<Medication[]>(
    propMedications || []
  );
  const [logs, setLogs] = useState<Record<string, MedicationLog[]>>({});
  const [loading, setLoading] = useState(!propMedications);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [logNotes, setLogNotes] = useState("");
  const [logStatus, setLogStatus] = useState<"taken" | "missed" | "skipped">(
    "taken"
  );
  const [sideEffects, setSideEffects] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!propMedications) {
      fetchMedicationsAndLogs();
    } else {
      setMedications(propMedications);
      fetchLogsForMedications(propMedications);
    }
  }, [propMedications]);

  const fetchMedicationsAndLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/patient/medications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setMedications(response.data.medications);
        fetchLogsForMedications(response.data.medications);
      }
    } catch (error: any) {
      toast.error("Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogsForMedications = async (meds: Medication[]) => {
    try {
      const token = localStorage.getItem("token");
      const logsMap: Record<string, MedicationLog[]> = {};

      await Promise.all(
        meds.map(async (med) => {
          const response = await axios.get(
            `${API_URL}/patient/medication-logs/${med._id}/today`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) {
            logsMap[med._id] = response.data.logs;
          }
        })
      );

      setLogs(logsMap);
    } catch (error) {
      console.error("Failed to fetch medication logs");
    }
  };

  const handleLogMedication = async () => {
    if (!selectedMed) return;

    try {
      const token = localStorage.getItem("token");

      const sideEffectsArray = sideEffects
        ? sideEffects
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];

      const response = await axios.post(
        `${API_URL}/patient/medication-log`,
        {
          medicationId: selectedMed._id,
          status: logStatus,
          notes: logNotes || null,
          sideEffects:
            sideEffectsArray.length > 0 ? sideEffectsArray : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(`Medication marked as ${logStatus}`);
        setDialogOpen(false);
        setLogNotes("");
        setLogStatus("taken");
        setSideEffects("");
        setSelectedMed(null);
        fetchLogsForMedications(medications);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to log medication");
    }
  };

  const getTodaysLogs = (medicationId: string) => {
    return logs[medicationId] || [];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "taken":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Taken
          </Badge>
        );
      case "missed":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Missed
          </Badge>
        );
      case "skipped":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Skipped
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading medications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          My Medications
        </CardTitle>
        <CardDescription>Track your prescribed medications</CardDescription>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active medications at this time
          </p>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => {
              const todaysLogs = getTodaysLogs(med._id);
              const latestLog = todaysLogs[0];
              const hasTakenToday = todaysLogs.some(
                (log) => log.status === "taken"
              );

              return (
                <Card key={med._id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {med.medicationName}
                          </h4>
                          {latestLog && getStatusBadge(latestLog.status)}
                        </div>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>
                            <span className="font-medium">Dosage:</span>{" "}
                            {med.dosage}
                          </p>
                          <p>
                            <span className="font-medium">Frequency:</span>{" "}
                            {med.frequency}
                          </p>
                          {med.instructions && (
                            <p>
                              <span className="font-medium">Instructions:</span>{" "}
                              {med.instructions}
                            </p>
                          )}
                          {todaysLogs.length > 0 && (
                            <>
                              <p className="text-xs pt-1">
                                Last logged: {formatTime(todaysLogs[0].takenAt)}
                              </p>
                              {todaysLogs[0].sideEffects &&
                                todaysLogs[0].sideEffects.length > 0 && (
                                  <p className="text-xs text-accent">
                                    Side effects:{" "}
                                    {todaysLogs[0].sideEffects.join(", ")}
                                  </p>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                      <Dialog
                        open={dialogOpen && selectedMed?._id === med._id}
                        onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) {
                            setSelectedMed(null);
                            setLogNotes("");
                            setLogStatus("taken");
                            setSideEffects("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedMed(med)}
                            variant={hasTakenToday ? "outline" : "default"}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Log Dose
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Log Medication</DialogTitle>
                            <DialogDescription>
                              Recording {med.medicationName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="status">Status *</Label>
                              <Select
                                value={logStatus}
                                onValueChange={(value: any) =>
                                  setLogStatus(value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="taken">Taken</SelectItem>
                                  <SelectItem value="missed">Missed</SelectItem>
                                  <SelectItem value="skipped">
                                    Skipped
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="sideEffects">
                                Side Effects (comma-separated)
                              </Label>
                              <Input
                                id="sideEffects"
                                value={sideEffects}
                                onChange={(e) => setSideEffects(e.target.value)}
                                placeholder="e.g., Nausea, Headache"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes (Optional)</Label>
                              <Textarea
                                id="notes"
                                value={logNotes}
                                onChange={(e) => setLogNotes(e.target.value)}
                                placeholder="Any additional notes..."
                                rows={3}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDialogOpen(false);
                                  setSelectedMed(null);
                                  setLogNotes("");
                                  setLogStatus("taken");
                                  setSideEffects("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleLogMedication}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
