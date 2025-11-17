import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Activity,
  User,
  Phone,
  Mail,
  Calendar,
  Thermometer,
  TrendingUp,
  AlertTriangle,
  Brain,
  Send,
  X,
  Clock,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MedicationManagementt } from "@/components/MedicationManagementt";

interface SymptomLog {
  _id: string;
  dayOfIllness: number;
  temperature: number;
  tempTime: string;
  createdAt: string;
}

interface PatientData {
  patient: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    bloodGroup: string;
    location: any;
  };
  episode: {
    id: string;
    startedAt: string;
    status: string;
    dayOfIllness: number;
  };
  symptomLogs: SymptomLog[];
  predictions: any[];
  medications: any[];
  alerts: any[];
  latestPrediction: any;
  latestSymptom: any;
}

interface TemperatureChartData {
  time: string;
  temp: number;
  day: number;
}

interface DayDetailData {
  time: string;
  temp: number;
  tempTime: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7777"

export default function PatientDetailVieww() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  // Alert state
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [sendingAlert, setSendingAlert] = useState(false);

  // Day detail state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/clinician/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setPatientData(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching patient details:", error);
      toast.error(
        error.response?.data?.error || "Failed to load patient details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewAIAnalysis = () => {
    navigate(`/clinician/patient/${patientId}/ai-analysis`);
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) {
      toast.error("Please enter an alert message");
      return;
    }

    try {
      setSendingAlert(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/clinician/patient/${patientId}/alert`,
        {
          message: alertMessage,
          severity: alertSeverity,
          alertType: "checkup_due",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Alert sent to patient successfully");
        setAlertMessage("");
        setAlertSeverity("medium");
        fetchPatientDetails();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  };

  // Temperature data for overview chart
  const temperatureData: TemperatureChartData[] = useMemo(() => {
    if (!patientData?.symptomLogs || patientData.symptomLogs.length === 0) {
      return [];
    }

    const dayMap = new Map<number, { temps: number[]; logs: SymptomLog[] }>();

    patientData.symptomLogs.forEach((log) => {
      if (!dayMap.has(log.dayOfIllness)) {
        dayMap.set(log.dayOfIllness, { temps: [], logs: [] });
      }
      dayMap.get(log.dayOfIllness)!.temps.push(log.temperature);
      dayMap.get(log.dayOfIllness)!.logs.push(log);
    });

    return Array.from(dayMap.entries())
      .sort(([dayA], [dayB]) => dayA - dayB)
      .map(([day, data]) => {
        const avgTemp =
          data.temps.reduce((sum, t) => sum + t, 0) / data.temps.length;
        return {
          time: `Day ${day}`,
          temp: parseFloat(avgTemp.toFixed(1)),
          day: day,
        };
      });
  }, [patientData?.symptomLogs]);

  // Detailed temperature data for selected day
  const dayDetailData: DayDetailData[] = useMemo(() => {
    if (!patientData?.symptomLogs || selectedDay === null) {
      return [];
    }

    const timeOrder = { morning: 1, afternoon: 2, evening: 3, night: 4 };

    return patientData.symptomLogs
      .filter((log) => log.dayOfIllness === selectedDay)
      .sort((a, b) => {
        const timeA = timeOrder[a.tempTime as keyof typeof timeOrder] || 0;
        const timeB = timeOrder[b.tempTime as keyof typeof timeOrder] || 0;
        return timeA - timeB;
      })
      .map((log, index) => {
        const timeLabel = log.tempTime
          ? log.tempTime.charAt(0).toUpperCase() + log.tempTime.slice(1)
          : `Reading ${index + 1}`;

        return {
          time: timeLabel,
          temp: log.temperature,
          tempTime: log.tempTime || "unknown",
          createdAt: log.createdAt,
        };
      });
  }, [patientData?.symptomLogs, selectedDay]);

  const currentDayOfIllness = useMemo(() => {
    if (!patientData?.symptomLogs || patientData.symptomLogs.length === 0) {
      return 0;
    }
    return Math.max(...patientData.symptomLogs.map((log) => log.dayOfIllness));
  }, [patientData?.symptomLogs]);

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedDay = data.activePayload[0].payload.day;
      setSelectedDay(clickedDay);
      setShowDayDetail(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Patient not found</p>
          <Button
            onClick={() => navigate("/clinician-dashboard")}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/clinician-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Patient Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Patient Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-2 border-border sticky top-6">
              <div className="text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mx-auto mb-4">
                  {patientData.patient.full_name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">
                  {patientData.patient.full_name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {patientData.patient.id.slice(0, 8)}...
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm break-all">
                    {patientData.patient.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{patientData.patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">
                    {patientData.patient.age}Y, {patientData.patient.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">
                    {patientData.patient.bloodGroup}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">
                    Day {patientData.episode.dayOfIllness}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Status */}
            {patientData.latestSymptom && (
              <Card className="p-6 border-2 border-border">
                <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-5 w-5 text-accent" />
                      <span className="text-sm text-muted-foreground">
                        Temperature
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {patientData.latestSymptom.temperature}°F
                    </p>
                  </div>
                  {patientData.latestPrediction && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Diagnosis
                        </span>
                      </div>
                      <Badge className="capitalize">
                        {patientData.latestPrediction.primaryDiagnosis}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence:{" "}
                        {patientData.latestPrediction.confidenceScore}%
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Temperature Chart */}
            {temperatureData.length > 0 && (
              <Card className="p-6 border-2 border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Temperature Trend</h3>
                  <Badge variant="outline">Day {currentDayOfIllness}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on any day to see detailed readings
                </p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={temperatureData} onClick={handleChartClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[97, 105]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: "#06b6d4", r: 6, cursor: "pointer" }}
                      activeDot={{ r: 8, cursor: "pointer" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Day Detail Chart */}
            {showDayDetail && selectedDay !== null && (
              <Card className="p-6 border-2 border-primary animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Day {selectedDay} - Detailed Readings
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDayDetail(false);
                      setSelectedDay(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {dayDetailData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={dayDetailData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          domain={[97, 105]}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          stroke="#f97316"
                          strokeWidth={3}
                          dot={{ fill: "#f97316", r: 5 }}
                          connectNulls={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-sm">All Readings:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {dayDetailData.map((reading, index) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium">
                                {reading.time}
                              </span>
                              <span className="text-xs text-muted-foreground block">
                                {new Date(
                                  reading.createdAt
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                            <span className="text-lg font-bold">
                              {reading.temp}°F
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center">
                    No readings found for Day {selectedDay}
                  </p>
                )}
              </Card>
            )}

            {/* Action Cards in Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Send Alert */}
              <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Alert
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="severity">Severity *</Label>
                    <Select
                      value={alertSeverity}
                      onValueChange={(value: any) => setAlertSeverity(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="alertMessage">Message *</Label>
                    <Textarea
                      id="alertMessage"
                      placeholder="Enter alert message..."
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleSendAlert}
                    disabled={sendingAlert || !alertMessage.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingAlert ? "Sending..." : "Send Alert"}
                  </Button>
                </div>
              </Card>

              {/* AI Analysis */}
              <Card className="p-6 border-2 border-primary/20 bg-primary/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Diagnosis
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View comprehensive analysis with FeFCon 2024 guidelines
                  </p>
                </div>
                <Button
                  onClick={handleViewAIAnalysis}
                  className="w-full bg-gradient-primary"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  View AI Analysis
                </Button>
              </Card>
            </div>

            {/* Medication Management */}
            <MedicationManagementt patientId={patientData.patient.id} />

            {/* Recent Alerts */}
            {patientData.alerts.length > 0 && (
              <Card className="p-6 border-2 border-accent/20 bg-accent/5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  Recent Alerts
                </h3>
                <div className="space-y-2">
                  {patientData.alerts.slice(0, 3).map((alert) => (
                    <div key={alert._id} className="p-3 bg-card rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
