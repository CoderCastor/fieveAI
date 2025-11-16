import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity,
  Thermometer,
  MessageSquare,
  Bell,
  User,
  Home,
  FileText,
  TrendingUp,
  AlertTriangle,
  Loader2,
  LogOut,
  X,
  Clock,
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { PatientMedicationss } from "@/components/PatientMedicationss";
import axios from "axios";
import { toast } from "sonner";

// TypeScript Interfaces
interface User {
  name: string;
  email: string;
}

interface Episode {
  _id: string;
  startedAt: string;
  status: string;
}

interface SymptomLog {
  _id: string;
  dayOfIllness: number;
  temperature: number;
  tempTime: string;
  createdAt: string;
}

interface Prediction {
  primaryDiagnosis: string;
  confidenceScore: number;
  urgency: string;
}

// Updated Medication interface to match PatientMedicationss expectations
interface Medication {
  _id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
  instructions?: string;
  startDate?: string;
  endDate?: string;
}

interface Alert {
  _id: string;
  message: string;
  severity: string;
  createdAt: string;
  isRead: boolean;
}

interface DashboardData {
  user: User;
  hasActiveEpisode: boolean;
  episode?: Episode;
  symptomLogs: SymptomLog[];
  latestPrediction?: Prediction;
  medications: Medication[];
  alerts: Alert[];
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

const PatientDashboardd = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentTemp, setCurrentTemp] = useState(98.6);
  const [feverStatus, setFeverStatus] = useState<
    "normal" | "mild" | "moderate" | "high"
  >("normal");

  // Day detail state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  // Alert state
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/signin-patient");
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No authentication token found");
        navigate("/signin-patient");
        return;
      }

      const response = await axios.get(
        `${process.env.BASE_URL}/patient/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const data: DashboardData = {
          user: response.data.user,
          hasActiveEpisode: response.data.hasActiveEpisode,
          episode: response.data.episode,
          symptomLogs: response.data.symptomLogs || [],
          latestPrediction: response.data.latestPrediction,
          medications: response.data.medications || [],
          alerts: response.data.alerts || [],
        };

        setDashboardData(data);

        if (data.symptomLogs && data.symptomLogs.length > 0) {
          const latest = data.symptomLogs[data.symptomLogs.length - 1];
          setCurrentTemp(latest.temperature);
          calculateFeverStatus(latest.temperature);
        }
      }
    } catch (error: any) {
      console.error("Dashboard error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        navigate("/signin-patient");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateFeverStatus = (temp: number) => {
    if (temp > 100.4) {
      setFeverStatus("high");
    } else if (temp > 99.5) {
      setFeverStatus("moderate");
    } else if (temp > 98.6) {
      setFeverStatus("mild");
    } else {
      setFeverStatus("normal");
    }
  };

  const getFeverColor = (): string => {
    switch (feverStatus) {
      case "high":
        return "text-red-600";
      case "moderate":
        return "text-orange-500";
      case "mild":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  const handleStartEpisode = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        navigate("/signin-patient");
        return;
      }

      const response = await axios.post(
        `${process.env.BASE_URL}/patient/episode/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Fever episode started!");
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start episode");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    toast.success("Logged out successfully");
    navigate("/signin-patient");
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
        `${process.env.BASE_URL}/patient/alert/send`,
        {
          message: alertMessage,
          severity: alertSeverity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Alert sent to clinician successfully");
        setAlertMessage("");
        setAlertSeverity("medium");
        setAlertDialogOpen(false);
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  };

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.BASE_URL}/patient/alerts/${alertId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchDashboardData();
    } catch (error) {
      console.error("Failed to mark alert as read");
    }
  };

  // Temperature data for chart
  const temperatureData: TemperatureChartData[] = useMemo(() => {
    if (!dashboardData?.symptomLogs || dashboardData.symptomLogs.length === 0) {
      return [];
    }

    const dayMap = new Map<number, { temps: number[]; logs: SymptomLog[] }>();

    dashboardData.symptomLogs.forEach((log) => {
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
  }, [dashboardData?.symptomLogs]);

  const dayDetailData: DayDetailData[] = useMemo(() => {
    if (!dashboardData?.symptomLogs || selectedDay === null) {
      return [];
    }

    const timeOrder = { morning: 1, afternoon: 2, evening: 3, night: 4 };

    return dashboardData.symptomLogs
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
  }, [dashboardData?.symptomLogs, selectedDay]);

  const currentDayOfIllness = useMemo(() => {
    if (!dashboardData?.symptomLogs || dashboardData.symptomLogs.length === 0) {
      return 0;
    }
    return Math.max(
      ...dashboardData.symptomLogs.map((log) => log.dayOfIllness)
    );
  }, [dashboardData?.symptomLogs]);

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedDay = data.activePayload[0].payload.day;
      setSelectedDay(clickedDay);
      setShowDayDetail(true);
    }
  };

  // Get unread clinician alerts count
  const unreadAlertsCount = useMemo(() => {
    if (!dashboardData?.alerts) return 0;
    return dashboardData.alerts.filter((a) => !a.isRead && a.severity !== "low")
      .length;
  }, [dashboardData?.alerts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-xl font-bold">FieveAI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => setActiveTab("alerts")}
                />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back,{" "}
            {localStorage.getItem("userName") ||
              dashboardData?.user?.name ||
              "Patient"}
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            {dashboardData?.hasActiveEpisode
              ? "Active fever episode"
              : "Healthy status"}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-8">
        {activeTab === "home" && (
          <div className="space-y-4">
            {!dashboardData?.hasActiveEpisode && (
              <Card className="p-6 border-2 border-border animate-scale-in">
                <div className="text-center space-y-4">
                  <Thermometer className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      No Active Fever Episode
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start tracking your fever to get AI-powered diagnosis and
                      monitoring
                    </p>
                    <Button
                      onClick={handleStartEpisode}
                      className="bg-gradient-primary"
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Start Fever Tracking
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {dashboardData?.hasActiveEpisode && (
              <>
                <Card className="p-6 border-2 border-border animate-scale-in hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Current Status</h2>
                    <Badge
                      variant={
                        feverStatus === "normal" ? "secondary" : "destructive"
                      }
                      className="animate-pulse-slow"
                    >
                      {feverStatus === "normal" ? "Healthy" : "Monitoring"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={`relative ${getFeverColor()}`}>
                      <div className="text-center">
                        <Thermometer className="h-20 w-20 mx-auto mb-2" />
                        <span className="text-3xl font-bold">
                          {currentTemp}°F
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fever Level</span>
                            <span className="font-medium capitalize">
                              {feverStatus}
                            </span>
                          </div>
                          <Progress
                            value={(currentTemp - 97) * 20}
                            className="h-2"
                          />
                        </div>
                        {dashboardData.latestPrediction && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                AI Diagnosis:
                              </span>
                              <Badge className="capitalize">
                                {
                                  dashboardData.latestPrediction
                                    .primaryDiagnosis
                                }
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Confidence:{" "}
                              {dashboardData.latestPrediction.confidenceScore}%
                              | Urgency:{" "}
                              {dashboardData.latestPrediction.urgency}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {feverStatus === "normal"
                            ? "Your temperature is within normal range."
                            : "Fever detected. Stay hydrated and rest."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Temperature Trend */}
                {temperatureData.length > 0 && (
                  <Card className="p-6 border-2 border-border animate-slide-up hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Temperature Trend
                      </h2>
                      <Badge variant="outline">Day {currentDayOfIllness}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click on any day to see detailed readings
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={temperatureData}
                        onClick={handleChartClick}
                      >
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
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{
                            fill: "hsl(var(--primary))",
                            r: 6,
                            cursor: "pointer",
                          }}
                          activeDot={{ r: 8, cursor: "pointer" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Day Detail */}
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
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={3}
                              dot={{ fill: "hsl(var(--chart-2))", r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>

                        <div className="mt-4 space-y-2">
                          <h4 className="font-semibold text-sm">
                            All Readings:
                          </h4>
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

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className="p-4 border-2 border-border hover-lift cursor-pointer animate-scale-in"
                    onClick={() => navigate("/symptom-log")}
                  >
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Log Symptoms</h3>
                    <p className="text-xs text-muted-foreground">
                      Record today's symptoms
                    </p>
                  </Card>
                  <Card
                    className="p-4 border-2 border-border hover-lift cursor-pointer animate-scale-in"
                    onClick={() => navigate("/chatbot")}
                  >
                    <MessageSquare className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">
                      Get health guidance
                    </p>
                  </Card>
                </div>

                {/* Send Alert to Clinician */}
                <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Send Alert to Clinician
                  </h3>
                  <Dialog
                    open={alertDialogOpen}
                    onOpenChange={setAlertDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Compose Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Alert to Clinician</DialogTitle>
                        <DialogDescription>
                          Notify your clinician about any urgent concerns
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="severity">Severity *</Label>
                          <Select
                            value={alertSeverity}
                            onValueChange={(value: any) =>
                              setAlertSeverity(value)
                            }
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
                            placeholder="Describe your concern..."
                            value={alertMessage}
                            onChange={(e) => setAlertMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAlertDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSendAlert}
                            disabled={sendingAlert || !alertMessage.trim()}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {sendingAlert ? "Sending..." : "Send Alert"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>

                {/* Medications */}
                {dashboardData.medications.length > 0 && (
                  <PatientMedicationss
                    medications={dashboardData.medications}
                  />
                )}

                {/* Recent Alerts from Clinician */}
                {dashboardData.alerts.length > 0 && (
                  <Card className="p-4 border-2 border-accent/20 bg-accent/5 animate-slide-up">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          Latest Alert from Clinician
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {dashboardData.alerts[0].message}
                        </p>
                        <Badge
                          variant={
                            dashboardData.alerts[0].severity === "critical"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {dashboardData.alerts[0].severity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("alerts")}
                          className="ml-2"
                        >
                          View All Alerts
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="animate-slide-up space-y-4">
            <Card className="p-6 border-2 border-border">
              <h2 className="text-xl font-bold mb-4">Your Alerts</h2>
              {dashboardData?.alerts && dashboardData.alerts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className={`p-4 border rounded-lg ${
                        !alert.isRead ? "bg-primary/5 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
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
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      {!alert.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAlertRead(alert._id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No alerts at this time.</p>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "home"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => navigate("/symptom-log")}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs font-medium">Logs</span>
            </button>
            <button
              onClick={() => navigate("/chatbot")}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
                activeTab === "alerts"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bell className="h-5 w-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-3 h-2 w-2 bg-destructive rounded-full" />
              )}
              <span className="text-xs font-medium">Alerts</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default PatientDashboardd;
