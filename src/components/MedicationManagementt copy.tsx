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
import { Pill, Plus, Trash2, Edit } from "lucide-react";
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

      if (response.data.success) {
        setMedications(response.data.medications);
      }
    } catch (error: any) {
      toast.error("Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (editingMed) {
        const response = await axios.put(
          `http://localhost:7777/clinician/medication/${editingMed._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          toast.success("Medication updated successfully");
        }
      } else {
        const response = await axios.post(
          `http://localhost:7777/clinician/patient/${patientId}/medication`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          toast.success("Medication prescribed successfully");
        }
      }

      setDialogOpen(false);
      setEditingMed(null);
      resetForm();
      fetchMedications();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save medication");
    }
  };

  const handleDelete = async (medId: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:7777/clinician/medication/${medId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Medication deleted");
        fetchMedications();
      }
    } catch (error: any) {
      toast.error("Failed to delete medication");
    }
  };

  const handleToggleActive = async (med: Medication) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:7777/clinician/medication/${med._id}`,
        { isActive: !med.isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          med.isActive ? "Medication deactivated" : "Medication activated"
        );
        fetchMedications();
      }
    } catch (error: any) {
      toast.error("Failed to update medication");
    }
  };

  const resetForm = () => {
    setFormData({
      medicationName: "",
      dosage: "",
      frequency: "",
      instructions: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
  };

  const openEditDialog = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      medicationName: med.medicationName,
      dosage: med.dosage,
      frequency: med.frequency,
      instructions: med.instructions || "",
      startDate: new Date(med.startDate).toISOString().split("T")[0],
      endDate: med.endDate
        ? new Date(med.endDate).toISOString().split("T")[0]
        : "",
    });
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
                resetForm();
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      required
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
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    placeholder="e.g., Take after food"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMed ? "Update" : "Prescribe"}
                  </Button>
                </div>
              </form>
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
                        onClick={() => handleToggleActive(med)}
                      >
                        {med.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(med)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(med._id)}
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
