import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Bell,
  Settings,
  MapPin,
  Thermometer,
  Clock,
  Filter,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
interface Patient {
  id: string;
  full_name: string;
  age: number;
  status: string;
  risk_score: number;
  updated_at: string;
  phone?: string;
  temperature?: number;
  diagnosis?: string;
}

interface Alert {
  id: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

interface DashboardStats {
  totalPatients: number;
  highRiskCount: number;
  criticalCount: number;
  unreadAlertsCount: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7777"

const ClinicianDashboardd = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    highRiskCount: 0,
    criticalCount: 0,
    unreadAlertsCount: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "risk" | "updated">("risk");
  const [loading, setLoading] = useState(true);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "clinician") {
      toast.error("Please login as clinician to access this dashboard");
      navigate("/signin-clinician");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/clinician/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setPatients(response.data.patients);
        setAlerts(response.data.alerts);
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error("Dashboard error:", error);
      if (error.response?.status === 403) {
        toast.error("Access denied. Clinician role required.");
        navigate("/signin-clinician");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        navigate("/signin-clinician");
      } else {
        toast.error("Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/signin-clinician");
  };

  const filteredPatients = patients
    .filter((patient) => {
      const matchesSearch =
        patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;

      const matchesRisk =
        riskFilter === "all" ||
        (riskFilter === "high" && patient.risk_score > 70) ||
        (riskFilter === "medium" &&
          patient.risk_score >= 40 &&
          patient.risk_score <= 70) ||
        (riskFilter === "low" && patient.risk_score < 40);

      return matchesSearch && matchesStatus && matchesRisk;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.full_name.localeCompare(b.full_name);
      } else if (sortBy === "risk") {
        return b.risk_score - a.risk_score;
      } else {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      }
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(new Set(filteredPatients.map((p) => p.id)));
    } else {
      setSelectedPatients(new Set());
    }
  };

  const handleSelectPatient = (patientId: string, checked: boolean) => {
    const newSelected = new Set(selectedPatients);
    if (checked) {
      newSelected.add(patientId);
    } else {
      newSelected.delete(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const handleExportSelected = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/clinician/export`,
        { patientIds: Array.from(selectedPatients) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const csvContent = [
          ["ID", "Name", "Email", "Phone", "Age", "Gender", "Blood Group"],
          ...response.data.data.map((p: any) => [
            p.id,
            p.name,
            p.email,
            p.phone,
            p.age,
            p.gender,
            p.bloodGroup,
          ]),
        ]
          .map((row) => row.join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `patients-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        toast.success(`Exported ${selectedPatients.size} patients`);
      }
    } catch (error) {
      toast.error("Failed to export patients");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "moderate":
        return "default";
      case "mild":
        return "secondary";
      case "active":
        return "default";
      default:
        return "outline";
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return "text-destructive";
    if (score > 50) return "text-accent";
    return "text-fever-mild";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">FieveAI</span>
            </Link>
            <span className="text-muted-foreground">Clinician Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {stats.unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                  {stats.unreadAlertsCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Metrics Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 border-border hover-lift animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-primary" />
              <TrendingUp className="h-5 w-5 text-fever-normal" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalPatients}</div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </Card>

          <Card
            className="p-6 border-2 border-accent/20 bg-accent/5 hover-lift animate-scale-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-accent" />
              <Badge variant="destructive">{stats.unreadAlertsCount}</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats.unreadAlertsCount}
            </div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </Card>

          <Card
            className="p-6 border-2 border-destructive/20 bg-destructive/5 hover-lift animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <Thermometer className="h-8 w-8 text-destructive" />
              <span className="text-sm font-medium">Live</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.highRiskCount}</div>
            <div className="text-sm text-muted-foreground">High Risk Cases</div>
          </Card>

          <Card
            className="p-6 border-2 border-border hover-lift animate-scale-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.criticalCount}</div>
            <div className="text-sm text-muted-foreground">Critical Cases</div>
          </Card>
        </div>

        {/* Patient List */}
        <Card className="border-2 border-border animate-slide-up">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Monitored Patients</h2>
              <Button
                size="sm"
                className="bg-gradient-primary"
                onClick={handleExportSelected}
                disabled={selectedPatients.size === 0}
              >
                Export ({selectedPatients.size})
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[140px]">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="high">High (&gt;70)</SelectItem>
                  <SelectItem value="medium">Medium (40-70)</SelectItem>
                  <SelectItem value="low">Low (&lt;40)</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: "name" | "risk" | "updated") =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Risk Score</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="updated">Last Updated</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground flex items-center">
                Showing {filteredPatients.length} of {patients.length} patients
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No patients found
              </div>
            ) : (
              <>
                <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-4">
                  <Checkbox
                    checked={
                      selectedPatients.size === filteredPatients.length &&
                      filteredPatients.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">Select All</span>
                </div>
                {filteredPatients.map((patient, index) => (
                  <div
                    key={patient.id}
                    className="p-6 hover:bg-muted/50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Checkbox
                          checked={selectedPatients.has(patient.id)}
                          onCheckedChange={(checked) =>
                            handleSelectPatient(patient.id, checked as boolean)
                          }
                        />
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {patient.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">
                              {patient.full_name}
                            </h3>
                            <Badge
                              variant={getStatusColor(patient.status)}
                              className="capitalize"
                            >
                              {patient.status}
                            </Badge>
                            {patient.diagnosis && (
                              <Badge variant="outline" className="capitalize">
                                {patient.diagnosis}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Age: {patient.age || "N/A"}</span>
                            {patient.temperature && (
                              <span className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3" />
                                {patient.temperature}°F
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(patient.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div
                            className={`text-2xl font-bold mb-1 ${getRiskColor(
                              patient.risk_score
                            )}`}
                          >
                            {patient.risk_score}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Risk Score
                          </div>
                        </div>
                        <Link to={`/clinician/patientt/${patient.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ClinicianDashboardd;
