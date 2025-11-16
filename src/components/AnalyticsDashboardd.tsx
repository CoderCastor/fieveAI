import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, AlertTriangle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Patient {
  id: string;
  full_name: string;
  age: number;
  status: string;
  risk_score: number;
  diagnosis?: string;
}

interface AnalyticsDashboardProps {
  patients: Patient[];
}

export function AnalyticsDashboardd({ patients }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "demographics"
  >("overview");

  // Calculate risk distribution
  const riskDistribution = [
    {
      name: "Low Risk",
      value: patients.filter((p) => p.risk_score < 40).length,
      color: "#10b981",
    },
    {
      name: "Medium Risk",
      value: patients.filter((p) => p.risk_score >= 40 && p.risk_score <= 70)
        .length,
      color: "#f59e0b",
    },
    {
      name: "High Risk",
      value: patients.filter((p) => p.risk_score > 70).length,
      color: "#ef4444",
    },
  ];

  // Calculate status breakdown
  const statusBreakdown = [
    {
      name: "Critical",
      value: patients.filter((p) => p.status === "critical").length,
    },
    { name: "High", value: patients.filter((p) => p.status === "high").length },
    {
      name: "Moderate",
      value: patients.filter((p) => p.status === "moderate").length,
    },
    { name: "Mild", value: patients.filter((p) => p.status === "mild").length },
    {
      name: "Active",
      value: patients.filter((p) => p.status === "active").length,
    },
  ];

  const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#06b6d4"];

  return (
    <Card className="mt-8 p-6 border-2 border-border animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Advanced Analytics
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          onClick={() => setActiveTab("overview")}
          className="rounded-b-none"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "trends" ? "default" : "ghost"}
          onClick={() => setActiveTab("trends")}
          className="rounded-b-none"
        >
          Trends
        </Button>
        <Button
          variant={activeTab === "demographics" ? "default" : "ghost"}
          onClick={() => setActiveTab("demographics")}
          className="rounded-b-none"
        >
          Demographics
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Risk Distribution Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Status Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Trend analysis coming soon...</p>
        </div>
      )}

      {/* Demographics Tab */}
      {activeTab === "demographics" && (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Demographic analysis coming soon...</p>
        </div>
      )}
    </Card>
  );
}
