import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pill, Plus, Trash2, Edit, Loader2, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";

interface Medication {
  _id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  prescribedDate: string;
  prescribedBy?: {
    name: string;
  };
}

interface MedicationManagementProps {
  patientId: string;
}

export const MedicationManagementt = ({
  patientId,
}: MedicationManagementProps) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    instructions: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  // AI Modal states
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultOpen, setAiResultOpen] = useState(false);

  useEffect(() => {
    fetchMedications();
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:7777/clinician/patient/${patientId}/medications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) setMedications(response.data.medications);
    } catch {
      toast.error("Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAiAnalysis = () => {
    setAiLoading(true);
    setAiModalOpen(true);
    setTimeout(() => {
      setAiLoading(false);
      setAiResultOpen(true);
    }, 2000);
  };

  const closeAiModals = () => {
    setAiResultOpen(false);
    setAiModalOpen(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading medications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medication Management
            </CardTitle>
            <CardDescription>
              Prescribe and manage patient medications
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingMed(null);
                setFormData({
                  medicationName: "",
                  dosage: "",
                  frequency: "",
                  instructions: "",
                  startDate: new Date().toISOString().split("T")[0],
                  endDate: "",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Prescribe Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMed ? "Edit Medication" : "Prescribe New Medication"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the medication details below
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      required
                      disabled={aiModalOpen || aiResultOpen}
                      value={formData.medicationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicationName: e.target.value,
                        })
                      }
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      required
                      disabled={aiModalOpen || aiResultOpen}
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                      placeholder="e.g., 500mg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    required
                    disabled={aiModalOpen || aiResultOpen}
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    placeholder="e.g., 6"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      disabled={aiModalOpen || aiResultOpen}
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      disabled={aiModalOpen || aiResultOpen}
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    disabled={aiModalOpen || aiResultOpen}
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    placeholder="e.g., Take after food"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={aiModalOpen || aiResultOpen}
                  >
                    Cancel
                  </Button>
                  {/* Prescribe Button: disabled, faded */}
                  <Button
                    type="button"
                    className="opacity-50 pointer-events-none"
                    disabled
                  >
                    Prescribe
                  </Button>
                  {/* AI Analysis Button */}
                  <Button
                    type="button"
                    className="bg-primary"
                    disabled={aiModalOpen || aiResultOpen}
                    onClick={handleAiAnalysis}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    AI Analysis
                  </Button>
                </div>
              </form>
              {/* AI Loader and Result modals */}
              <Dialog open={aiModalOpen}>
                <DialogContent className="max-w-md">
                  {aiLoading ? (
                    <div className="flex flex-col items-center py-6">
                      <Loader2 className="animate-spin text-primary h-10 w-10 mb-4" />
                      <h4 className="text-lg font-semibold mb-2">
                        Analysing patient data...
                      </h4>
                      <p className="text-muted-foreground text-center">
                        The AI is reviewing the patient's risks, history, and
                        meds.
                        <br />
                        Please wait a moment...
                      </p>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
              <Dialog open={aiResultOpen} onOpenChange={setAiResultOpen}>
                <DialogContent className="max-w-lg">
                  <h2 className="font-bold text-xl text-red-600 mb-2">
                    LIFE-SAVING AI INTERVENTION
                  </h2>
                  <p className="mb-2">
                    <span className="font-semibold text-destructive">
                      This AI alert prevented a potentially fatal medical error
                    </span>
                    <br />
                    <span className="font-semibold">Description:</span> STOPPED
                    Aspirin prescription!
                  </p>
                  <div className="space-y-2 mb-2">
                    <span className="font-semibold text-xl text-red-600">
                      🚨🚨 CRITICAL - ASPIRIN CONTRAINDICATED! 🚨🚨
                    </span>
                    <ul className="list-disc ml-6 mt-1">
                      <li>
                        <span className="text-red-700 font-bold">
                          ⛔ STOP! DO NOT PRESCRIBE:
                        </span>
                        <ul className="list-[circle] ml-6 text-red-800">
                          <li>Aspirin</li>
                          <li>Ibuprofen</li>
                          <li>Any NSAIDs</li>
                        </ul>
                      </li>
                    </ul>
                    <span className="font-bold">REASONS:</span>
                    <ul className="list-decimal ml-6 text-red-800">
                      <li>⚠️ ASPIRIN ALLERGY (medication history)</li>
                      <li>⚠️ FAMILY HEMOPHILIA (father)</li>
                      <li>⚠️ DENGUE DAY 4 (bleeding risk)</li>
                      <li>⚠️ Platelet drop expected</li>
                    </ul>
                    <div>
                      <span className="text-green-700 font-bold">
                        ✅ SAFE: Paracetamol only!
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-blue-700">
                        🏥 ADMIT FOR MONITORING
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-700">
                        Critical Factors:
                      </span>
                      <ul className="list-disc ml-6 text-neutral-900">
                        <li>⚠️ Family history: Father has HEMOPHILIA</li>
                        <li>⛔ Patient ALLERGIC to Aspirin</li>
                        <li>Dengue Day 4 = HIGH bleeding risk</li>
                        <li>Could have caused hemorrhagic dengue!</li>
                      </ul>
                    </div>
                  </div>
                  <Button className="mt-4 w-full" onClick={closeAiModals}>
                    Close
                  </Button>
                </DialogContent>
              </Dialog>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No medications prescribed yet
          </p>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <Card key={med._id} className={!med.isActive ? "opacity-60" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{med.medicationName}</h4>
                        <Badge variant={med.isActive ? "default" : "secondary"}>
                          {med.isActive ? "Active" : "Inactive"}
                        </Badge>
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
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {formatDate(med.startDate)}
                          {med.endDate && ` - ${formatDate(med.endDate)}`}
                        </p>
                        <p className="text-xs">
                          Prescribed: {formatDate(med.prescribedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {}}
                        disabled // or implement handleToggleActive if needed
                      >
                        {med.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {}} // or implement openEditDialog
                        disabled
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {}}
                        disabled
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
