import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Activity, Users, Pill, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientMedicalHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("episode");

  // Episode History State
  const [episodeHistory, setEpisodeHistory] = useState({
    priorAntibiotics: false,
    antibioticName: "",
    antibioticStartDate: "",
    hasDiabetes: false,
    immunocompromised: false,
    isPregnant: false,
    chronicDiseases: "",
    recentTravel: false,
    travelLocation: "",
    travelReturnDate: "",
    mosquitoExposure: false,
    sickContacts: false,
    waterSource: "filtered",
    feverPattern: "continuous",
    highestTemperature: "",
    measurementMethod: "digital",
  });

  // Family History State
  const [familyHistory, setFamilyHistory] = useState({
    hemophilia: false,
    hemophiliaRelation: "",
    dengueHistory: false,
    dengueCount: "",
    lastDengueYear: "",
    diabetes: false,
    hypertension: false,
    heartDisease: false,
    kidneyDisease: false,
    liverDisease: false,
    notes: "",
  });

  // Fever Episode State
  const [feverEpisode, setFeverEpisode] = useState({
    status: "active",
    finalDiagnosis: "unknown",
    labConfirmed: false,
    confirmationDate: "",
    hospitalized: false,
    hospitalName: "",
    admissionDate: "",
    dischargeDate: "",
    clinicianNotes: "",
  });

  // Medication History State
  const [medicationHistory, setMedicationHistory] = useState({
    medicationName: "",
    category: "antibiotic",
    prescribedBy: "",
    prescribedDate: "",
    indication: "",
    hadReaction: false,
    reactionType: "",
    reactionSeverity: "mild",
    wasEffective: false,
    sideEffects: "",
    notes: "",
  });

  const handleEpisodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Episode History:", episodeHistory);
    toast.success("Episode history submitted successfully!");
  };

  const handleFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Family History:", familyHistory);
    toast.success("Family history submitted successfully!");
  };

  const handleFeverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Fever Episode:", feverEpisode);
    toast.success("Fever episode history submitted successfully!");
  };

  const handleMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Medication History:", medicationHistory);
    toast.success("Medication history submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold mb-2">📋 Patient Medical History</h1>
          <p className="text-muted-foreground">
            Complete your medical history for better diagnosis and care
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("episode")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "episode"
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            }`}
          >
            <Activity className="h-4 w-4" />
            Episode History
          </button>
          <button
            onClick={() => setActiveTab("family")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "family"
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            }`}
          >
            <Users className="h-4 w-4" />
            Family History
          </button>
          <button
            onClick={() => setActiveTab("fever")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "fever"
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Fever Episodes
          </button>
          <button
            onClick={() => setActiveTab("medication")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "medication"
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            }`}
          >
            <Pill className="h-4 w-4" />
            Medication History
          </button>
        </div>

        {/* Episode History Form */}
        {activeTab === "episode" && (
          <Card className="p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Episode History
            </h2>
            <form onSubmit={handleEpisodeSubmit} className="space-y-6">
              {/* Prior Treatment */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Prior Treatment</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="priorAntibiotics"
                    checked={episodeHistory.priorAntibiotics}
                    onCheckedChange={(checked) =>
                      setEpisodeHistory({
                        ...episodeHistory,
                        priorAntibiotics: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="priorAntibiotics">Taken antibiotics before this episode</Label>
                </div>
                {episodeHistory.priorAntibiotics && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Antibiotic Name</Label>
                      <Input
                        value={episodeHistory.antibioticName}
                        onChange={(e) =>
                          setEpisodeHistory({ ...episodeHistory, antibioticName: e.target.value })
                        }
                        placeholder="e.g., Azithromycin"
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={episodeHistory.antibioticStartDate}
                        onChange={(e) =>
                          setEpisodeHistory({
                            ...episodeHistory,
                            antibioticStartDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Conditions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Medical Conditions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasDiabetes"
                      checked={episodeHistory.hasDiabetes}
                      onCheckedChange={(checked) =>
                        setEpisodeHistory({ ...episodeHistory, hasDiabetes: checked as boolean })
                      }
                    />
                    <Label htmlFor="hasDiabetes">Diabetes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="immunocompromised"
                      checked={episodeHistory.immunocompromised}
                      onCheckedChange={(checked) =>
                        setEpisodeHistory({
                          ...episodeHistory,
                          immunocompromised: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="immunocompromised">Immunocompromised</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPregnant"
                      checked={episodeHistory.isPregnant}
                      onCheckedChange={(checked) =>
                        setEpisodeHistory({ ...episodeHistory, isPregnant: checked as boolean })
                      }
                    />
                    <Label htmlFor="isPregnant">Pregnant</Label>
                  </div>
                </div>
                <div>
                  <Label>Chronic Diseases (comma-separated)</Label>
                  <Input
                    value={episodeHistory.chronicDiseases}
                    onChange={(e) =>
                      setEpisodeHistory({ ...episodeHistory, chronicDiseases: e.target.value })
                    }
                    placeholder="e.g., Asthma, Hypertension"
                  />
                </div>
              </div>

              {/* Exposure History */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Exposure & Travel</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recentTravel"
                      checked={episodeHistory.recentTravel}
                      onCheckedChange={(checked) =>
                        setEpisodeHistory({ ...episodeHistory, recentTravel: checked as boolean })
                      }
                    />
                    <Label htmlFor="recentTravel">Recent Travel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mosquitoExposure"
                      checked={episodeHistory.mosquitoExposure}
                      onCheckedChange={(checked) =>
                        setEpisodeHistory({
                          ...episodeHistory,
                          mosquitoExposure: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="mosquitoExposure">Mosquito Exposure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sickContacts"
                      checked={episodeHistory.sickContacts}
                      onCheckedChange={(checked) =>
                        setEpisodeHistory({ ...episodeHistory, sickContacts: checked as boolean })
                      }
                    />
                    <Label htmlFor="sickContacts">Contact with Sick People</Label>
                  </div>
                </div>
                {episodeHistory.recentTravel && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Travel Location</Label>
                      <Input
                        value={episodeHistory.travelLocation}
                        onChange={(e) =>
                          setEpisodeHistory({ ...episodeHistory, travelLocation: e.target.value })
                        }
                        placeholder="e.g., Kerala"
                      />
                    </div>
                    <div>
                      <Label>Return Date</Label>
                      <Input
                        type="date"
                        value={episodeHistory.travelReturnDate}
                        onChange={(e) =>
                          setEpisodeHistory({
                            ...episodeHistory,
                            travelReturnDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Fever Pattern */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Fever Pattern</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Water Source</Label>
                    <Select
                      value={episodeHistory.waterSource}
                      onValueChange={(value) =>
                        setEpisodeHistory({ ...episodeHistory, waterSource: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filtered">Filtered</SelectItem>
                        <SelectItem value="tap">Tap</SelectItem>
                        <SelectItem value="well">Well</SelectItem>
                        <SelectItem value="outside">Outside</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fever Pattern</Label>
                    <Select
                      value={episodeHistory.feverPattern}
                      onValueChange={(value) =>
                        setEpisodeHistory({ ...episodeHistory, feverPattern: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continuous">Continuous</SelectItem>
                        <SelectItem value="intermittent">Intermittent</SelectItem>
                        <SelectItem value="evening_rise">Evening Rise</SelectItem>
                        <SelectItem value="morning_peak">Morning Peak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Highest Temperature (°F)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={episodeHistory.highestTemperature}
                      onChange={(e) =>
                        setEpisodeHistory({
                          ...episodeHistory,
                          highestTemperature: e.target.value,
                        })
                      }
                      placeholder="e.g., 103.5"
                    />
                  </div>
                  <div>
                    <Label>Measurement Method</Label>
                    <Select
                      value={episodeHistory.measurementMethod}
                      onValueChange={(value) =>
                        setEpisodeHistory({ ...episodeHistory, measurementMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="infrared">Infrared</SelectItem>
                        <SelectItem value="mercury">Mercury</SelectItem>
                        <SelectItem value="touch">Touch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Submit Episode History
              </Button>
            </form>
          </Card>
        )}

        {/* Family History Form */}
        {activeTab === "family" && (
          <Card className="p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Family History
            </h2>
            <form onSubmit={handleFamilySubmit} className="space-y-6">
              {/* Hereditary Conditions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Hereditary Conditions</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hemophilia"
                    checked={familyHistory.hemophilia}
                    onCheckedChange={(checked) =>
                      setFamilyHistory({ ...familyHistory, hemophilia: checked as boolean })
                    }
                  />
                  <Label htmlFor="hemophilia">Family History of Hemophilia</Label>
                </div>
                {familyHistory.hemophilia && (
                  <div>
                    <Label>Relation</Label>
                    <Input
                      value={familyHistory.hemophiliaRelation}
                      onChange={(e) =>
                        setFamilyHistory({ ...familyHistory, hemophiliaRelation: e.target.value })
                      }
                      placeholder="e.g., Father, Mother, Sibling"
                    />
                  </div>
                )}
              </div>

              {/* Dengue History */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Past Dengue History</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dengueHistory"
                    checked={familyHistory.dengueHistory}
                    onCheckedChange={(checked) =>
                      setFamilyHistory({ ...familyHistory, dengueHistory: checked as boolean })
                    }
                  />
                  <Label htmlFor="dengueHistory">Had Dengue Before</Label>
                </div>
                {familyHistory.dengueHistory && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Number of Times</Label>
                      <Input
                        type="number"
                        value={familyHistory.dengueCount}
                        onChange={(e) =>
                          setFamilyHistory({ ...familyHistory, dengueCount: e.target.value })
                        }
                        placeholder="e.g., 1"
                      />
                    </div>
                    <div>
                      <Label>Last Episode Year</Label>
                      <Input
                        type="number"
                        value={familyHistory.lastDengueYear}
                        onChange={(e) =>
                          setFamilyHistory({ ...familyHistory, lastDengueYear: e.target.value })
                        }
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Family Medical Conditions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Family Medical Conditions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="diabetes"
                      checked={familyHistory.diabetes}
                      onCheckedChange={(checked) =>
                        setFamilyHistory({ ...familyHistory, diabetes: checked as boolean })
                      }
                    />
                    <Label htmlFor="diabetes">Diabetes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hypertension"
                      checked={familyHistory.hypertension}
                      onCheckedChange={(checked) =>
                        setFamilyHistory({ ...familyHistory, hypertension: checked as boolean })
                      }
                    />
                    <Label htmlFor="hypertension">Hypertension</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="heartDisease"
                      checked={familyHistory.heartDisease}
                      onCheckedChange={(checked) =>
                        setFamilyHistory({ ...familyHistory, heartDisease: checked as boolean })
                      }
                    />
                    <Label htmlFor="heartDisease">Heart Disease</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kidneyDisease"
                      checked={familyHistory.kidneyDisease}
                      onCheckedChange={(checked) =>
                        setFamilyHistory({ ...familyHistory, kidneyDisease: checked as boolean })
                      }
                    />
                    <Label htmlFor="kidneyDisease">Kidney Disease</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="liverDisease"
                      checked={familyHistory.liverDisease}
                      onCheckedChange={(checked) =>
                        setFamilyHistory({ ...familyHistory, liverDisease: checked as boolean })
                      }
                    />
                    <Label htmlFor="liverDisease">Liver Disease</Label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={familyHistory.notes}
                  onChange={(e) => setFamilyHistory({ ...familyHistory, notes: e.target.value })}
                  placeholder="Any other family medical history..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Family History
              </Button>
            </form>
          </Card>
        )}

        {/* Fever Episode Form */}
        {activeTab === "fever" && (
          <Card className="p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Fever Episode History
            </h2>
            <form onSubmit={handleFeverSubmit} className="space-y-6">
              {/* Episode Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Episode Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current Status</Label>
                    <Select
                      value={feverEpisode.status}
                      onValueChange={(value) =>
                        setFeverEpisode({ ...feverEpisode, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="hospitalized">Hospitalized</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Final Diagnosis</Label>
                    <Select
                      value={feverEpisode.finalDiagnosis}
                      onValueChange={(value) =>
                        setFeverEpisode({ ...feverEpisode, finalDiagnosis: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dengue">Dengue</SelectItem>
                        <SelectItem value="typhoid">Typhoid</SelectItem>
                        <SelectItem value="malaria">Malaria</SelectItem>
                        <SelectItem value="covid">COVID-19</SelectItem>
                        <SelectItem value="viral">Viral Fever</SelectItem>
                        <SelectItem value="bacterial">Bacterial</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Lab Confirmation */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Lab Confirmation</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="labConfirmed"
                    checked={feverEpisode.labConfirmed}
                    onCheckedChange={(checked) =>
                      setFeverEpisode({ ...feverEpisode, labConfirmed: checked as boolean })
                    }
                  />
                  <Label htmlFor="labConfirmed">Diagnosis Lab Confirmed</Label>
                </div>
                {feverEpisode.labConfirmed && (
                  <div>
                    <Label>Confirmation Date</Label>
                    <Input
                      type="date"
                      value={feverEpisode.confirmationDate}
                      onChange={(e) =>
                        setFeverEpisode({ ...feverEpisode, confirmationDate: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Hospitalization */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Hospitalization</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hospitalized"
                    checked={feverEpisode.hospitalized}
                    onCheckedChange={(checked) =>
                      setFeverEpisode({ ...feverEpisode, hospitalized: checked as boolean })
                    }
                  />
                  <Label htmlFor="hospitalized">Was Hospitalized</Label>
                </div>
                {feverEpisode.hospitalized && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Hospital Name</Label>
                      <Input
                        value={feverEpisode.hospitalName}
                        onChange={(e) =>
                          setFeverEpisode({ ...feverEpisode, hospitalName: e.target.value })
                        }
                        placeholder="e.g., City Hospital"
                      />
                    </div>
                    <div>
                      <Label>Admission Date</Label>
                      <Input
                        type="date"
                        value={feverEpisode.admissionDate}
                        onChange={(e) =>
                          setFeverEpisode({ ...feverEpisode, admissionDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Discharge Date</Label>
                      <Input
                        type="date"
                        value={feverEpisode.dischargeDate}
                        onChange={(e) =>
                          setFeverEpisode({ ...feverEpisode, dischargeDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Clinician Notes */}
              <div>
                <Label>Clinician Notes</Label>
                <Textarea
                  value={feverEpisode.clinicianNotes}
                  onChange={(e) =>
                    setFeverEpisode({ ...feverEpisode, clinicianNotes: e.target.value })
                  }
                  placeholder="Any additional notes from the episode..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Fever Episode
              </Button>
            </form>
          </Card>
        )}

        {/* Medication History Form */}
        {activeTab === "medication" && (
          <Card className="p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Medication History
            </h2>
            <form onSubmit={handleMedicationSubmit} className="space-y-6">
              {/* Medication Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Medication Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Medication Name *</Label>
                    <Input
                      required
                      value={medicationHistory.medicationName}
                      onChange={(e) =>
                        setMedicationHistory({
                          ...medicationHistory,
                          medicationName: e.target.value,
                        })
                      }
                      placeholder="e.g., Aspirin"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={medicationHistory.category}
                      onValueChange={(value) =>
                        setMedicationHistory({ ...medicationHistory, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="antibiotic">Antibiotic</SelectItem>
                        <SelectItem value="painkiller">Painkiller</SelectItem>
                        <SelectItem value="antipyretic">Antipyretic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Prescription Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Prescription Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prescribed By</Label>
                    <Input
                      value={medicationHistory.prescribedBy}
                      onChange={(e) =>
                        setMedicationHistory({
                          ...medicationHistory,
                          prescribedBy: e.target.value,
                        })
                      }
                      placeholder="e.g., Dr. Smith"
                    />
                  </div>
                  <div>
                    <Label>Prescribed Date</Label>
                    <Input
                      type="date"
                      value={medicationHistory.prescribedDate}
                      onChange={(e) =>
                        setMedicationHistory({
                          ...medicationHistory,
                          prescribedDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Indication</Label>
                    <Input
                      value={medicationHistory.indication}
                      onChange={(e) =>
                        setMedicationHistory({ ...medicationHistory, indication: e.target.value })
                      }
                      placeholder="e.g., Fever, Infection"
                    />
                  </div>
                </div>
              </div>

              {/* Allergic Reaction */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Allergic Reaction</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hadReaction"
                    checked={medicationHistory.hadReaction}
                    onCheckedChange={(checked) =>
                      setMedicationHistory({
                        ...medicationHistory,
                        hadReaction: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="hadReaction">Had Allergic Reaction</Label>
                </div>
                {medicationHistory.hadReaction && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Reaction Type</Label>
                      <Input
                        value={medicationHistory.reactionType}
                        onChange={(e) =>
                          setMedicationHistory({
                            ...medicationHistory,
                            reactionType: e.target.value,
                          })
                        }
                        placeholder="e.g., Rash, Breathing Issues"
                      />
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <Select
                        value={medicationHistory.reactionSeverity}
                        onValueChange={(value) =>
                          setMedicationHistory({
                            ...medicationHistory,
                            reactionSeverity: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Effectiveness */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Effectiveness</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wasEffective"
                    checked={medicationHistory.wasEffective}
                    onCheckedChange={(checked) =>
                      setMedicationHistory({
                        ...medicationHistory,
                        wasEffective: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="wasEffective">Medication Was Effective</Label>
                </div>
                <div>
                  <Label>Side Effects (comma-separated)</Label>
                  <Input
                    value={medicationHistory.sideEffects}
                    onChange={(e) =>
                      setMedicationHistory({ ...medicationHistory, sideEffects: e.target.value })
                    }
                    placeholder="e.g., Nausea, Dizziness"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={medicationHistory.notes}
                  onChange={(e) =>
                    setMedicationHistory({ ...medicationHistory, notes: e.target.value })
                  }
                  placeholder="Any other notes about this medication..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Medication History
              </Button>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PatientMedicalHistory;
