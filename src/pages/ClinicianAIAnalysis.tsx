import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../components/AdvancedAI.css";
import {
  FaUserMd,
  FaExclamationTriangle,
  FaFlask,
  FaChartLine,
  FaHistory,
  FaHeartbeat,
  FaThermometerHalf,
  FaVial,
} from "react-icons/fa";

function ClinicianAIAnalysis() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("diagnosis");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "clinician") {
      toast.error("Please login as clinician");
      navigate("/signin-clinician");
      return;
    }

    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.BASE_URL}/clinician/patient/${patientId}/ai-analysis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const data = response.data.data;

        if (!data.symptoms) {
          toast.error("No symptom data found for this patient.");
          navigate(`/clinician/patient/${patientId}`);
          return;
        }

        setPatientData(data);

        if (data.latestPrediction) {
          setPredictionData({
            prediction:
              data.latestPrediction.primaryDiagnosis.charAt(0).toUpperCase() +
              data.latestPrediction.primaryDiagnosis.slice(1),
            confidence: data.latestPrediction.confidenceScore,
            urgency: data.latestPrediction.urgency,
            fefcon_recommendation: data.latestPrediction.fefconRecommendation,
            investigations_needed:
              data.latestPrediction.investigationsNeeded || [],
            red_flags: [],
            monitoring_plan: [],
            all_probabilities: {
              Dengue: data.latestPrediction.dengueProbability,
              Malaria: data.latestPrediction.malariaProbability,
              Typhoid: data.latestPrediction.typhoidProbability,
              Viral: data.latestPrediction.viralProbability,
              Other: 0,
            },
            top_3_predictions: [
              {
                disease: "Dengue",
                probability: data.latestPrediction.dengueProbability,
              },
              {
                disease: "Typhoid",
                probability: data.latestPrediction.typhoidProbability,
              },
              {
                disease: "Malaria",
                probability: data.latestPrediction.malariaProbability,
              },
            ].sort((a, b) => b.probability - a.probability),
          });
        } else {
          await getAIPrediction(data);
        }
      }
    } catch (error) {
      console.error("Error loading patient data:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        navigate("/signin-clinician");
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.error || "Patient data not found");
        navigate(`/clinician/patient/${patientId}`);
      } else {
        toast.error("Failed to load patient data");
      }
    } finally {
      setLoading(false);
    }
  };

  const getAIPrediction = async (data) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.BASE_URL}/ml/predict`,
        {
          patientId: data.patient._id,
          episodeId: data.episode._id,
          temperature: data.symptoms.temperature,
          fever_days: data.symptoms.dayOfIllness,
          headache: data.symptoms.headache ? 1 : 0,
          body_pain: data.symptoms.bodyPain ? 1 : 0,
          eye_pain: data.symptoms.eyePain ? 1 : 0,
          nausea_vomiting: data.symptoms.vomiting ? 1 : 0,
          abdominal_pain: data.symptoms.abdominalPain ? 1 : 0,
          rash: data.symptoms.rash ? 1 : 0,
          bleeding: data.symptoms.bleeding ? 1 : 0,
          platelet_count: 95,
          mosquito_exposure: data.history.mosquitoExposure ? 1 : 0,
          travel: data.history.recentTravel ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPredictionData(response.data);
    } catch (error) {
      console.error("Error getting prediction:", error);
      toast.error("Failed to get AI prediction");
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      LOW: "#27ae60",
      MEDIUM: "#f39c12",
      HIGH: "#e74c3c",
      EMERGENCY: "#c0392b",
      CRITICAL: "#8b0000",
    };
    return colors[urgency] || "#95a5a6";
  };

  const getDiseaseColor = (disease) => {
    const colors = {
      Dengue: "#ff6b6b",
      Malaria: "#4ecdc4",
      Typhoid: "#45b7d1",
      Viral: "#96ceb4",
      Other: "#ffeaa7",
    };
    return colors[disease] || "#dfe6e9";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading patient analysis...</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="error-container">
        <p>No patient data available</p>
        <button onClick={() => navigate(`/clinician/patient/${patientId}`)}>
          Back to Patient Details
        </button>
      </div>
    );
  }

  return (
    <div className="advanced-ai-container">
      {/* Header */}
      <div className="page-header">
        <Button
          variant="ghost"
          onClick={() => navigate(`/clinician/patient/${patientId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patient Details
        </Button>
        <h1>🏥 Advanced AI Diagnosis - Clinician View</h1>
        <p className="subtitle">
          Comprehensive analysis with FeFCon 2024 Guidelines for{" "}
          {patientData.patient.name}
        </p>
      </div>

      {/* Patient Info Card */}
      <div className="patient-card">
        <div className="patient-header">
          <div className="patient-avatar">
            <FaUserMd size={50} />
          </div>
          <div className="patient-info">
            <h2>{patientData.patient.name}</h2>
            <div className="patient-details">
              <span>📧 {patientData.patient.email}</span>
              <span>📱 {patientData.patient.phone || "N/A"}</span>
              <span>🩸 {patientData.patient.bloodGroup}</span>
              <span>
                👤 {patientData.patient.age}Y /{" "}
                {patientData.patient.gender.toUpperCase()}
              </span>
              <span>
                📍 {patientData.patient.location.city},{" "}
                {patientData.patient.location.state}
              </span>
            </div>
          </div>
          <div className="episode-badge">
            <div
              className={`status-badge status-${patientData.episode.status}`}
            >
              {patientData.episode.status.toUpperCase()}
            </div>
            <p>Day {patientData.episode.dayOfIllness} of Illness</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === "diagnosis" ? "active" : ""}`}
          onClick={() => setActiveTab("diagnosis")}
        >
          🔬 AI Diagnosis
        </button>
        <button
          className={`tab ${activeTab === "fefcon" ? "active" : ""}`}
          onClick={() => setActiveTab("fefcon")}
        >
          📋 FeFCon Guidelines
        </button>
        <button
          className={`tab ${activeTab === "symptoms" ? "active" : ""}`}
          onClick={() => setActiveTab("symptoms")}
        >
          💊 Symptoms Timeline
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📜 Medical History
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {/* DIAGNOSIS TAB */}
        {activeTab === "diagnosis" && predictionData && (
          <div className="diagnosis-grid">
            {/* Main Prediction */}
            <div className="card prediction-card">
              <h3>
                <FaFlask /> AI Prediction Result
              </h3>
              <div
                className="disease-badge-large"
                style={{
                  backgroundColor: getDiseaseColor(predictionData.prediction),
                }}
              >
                {predictionData.prediction}
              </div>
              <div className="confidence-display">
                <div className="confidence-text">
                  <span>Confidence Score</span>
                  <strong>{predictionData.confidence.toFixed(1)}%</strong>
                </div>
                <div className="confidence-bar-large">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${predictionData.confidence}%`,
                      backgroundColor: getDiseaseColor(
                        predictionData.prediction
                      ),
                    }}
                  />
                </div>
              </div>
              <div className="model-info">
                <small>Model: Gradient Boosting | Accuracy: 77.3%</small>
              </div>
            </div>

            {/* Urgency Alert */}
            <div
              className="card urgency-card"
              style={{
                borderLeft: `5px solid ${getUrgencyColor(
                  predictionData.urgency
                )}`,
              }}
            >
              <h3>
                <FaExclamationTriangle /> Clinical Urgency
              </h3>
              <div
                className="urgency-badge-large"
                style={{
                  backgroundColor: getUrgencyColor(predictionData.urgency),
                }}
              >
                {predictionData.urgency}
              </div>
              {predictionData.urgency === "HIGH" ||
              predictionData.urgency === "EMERGENCY" ? (
                <div className="alert-message">
                  <p>⚠️ Immediate medical attention required</p>
                  <p>Patient should be closely monitored</p>
                </div>
              ) : (
                <div className="safe-message">
                  <p>✅ Standard care protocol applicable</p>
                </div>
              )}
            </div>

            {/* All Probabilities */}
            <div className="card probabilities-card">
              <h3>
                <FaChartLine /> Differential Diagnosis
              </h3>
              <div className="probability-list-advanced">
                {predictionData.top_3_predictions.map((pred, idx) => (
                  <div key={idx} className="prob-item-advanced">
                    <div className="prob-label">
                      <span className="rank-badge">#{idx + 1}</span>
                      <span className="disease-name">{pred.disease}</span>
                    </div>
                    <div className="prob-visual">
                      <div className="prob-bar-bg">
                        <div
                          className="prob-bar-fill"
                          style={{
                            width: `${pred.probability}%`,
                            backgroundColor: getDiseaseColor(pred.disease),
                          }}
                        />
                      </div>
                      <span className="prob-value">
                        {pred.probability.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Vitals */}
            <div className="card vitals-card">
              <h3>
                <FaHeartbeat /> Current Vitals
              </h3>
              <div className="vitals-grid">
                <div className="vital-item">
                  <FaThermometerHalf size={24} color="#e74c3c" />
                  <span className="vital-label">Temperature</span>
                  <span className="vital-value">
                    {patientData.symptoms.temperature}°F
                  </span>
                </div>
                <div className="vital-item">
                  <FaHeartbeat size={24} color="#e74c3c" />
                  <span className="vital-label">Pulse Rate</span>
                  <span className="vital-value">
                    {patientData.symptoms.pulseRate} bpm
                  </span>
                </div>
                <div className="vital-item">
                  <FaVial size={24} color="#c0392b" />
                  <span className="vital-label">Platelet Count</span>
                  <span className="vital-value critical">95 ×10³/μL</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEFCON TAB */}
        {activeTab === "fefcon" && predictionData && (
          <div className="fefcon-container">
            <div className="fefcon-header">
              <h2>📋 FeFCon 2024 Clinical Guidelines</h2>
              <p>Evidence-based recommendations for fever management</p>
            </div>

            <div className="card fefcon-recommendation">
              <h3>🏥 Primary Recommendation</h3>
              <div className="recommendation-box">
                <p>{predictionData.fefcon_recommendation}</p>
              </div>
            </div>

            <div className="card fefcon-investigations">
              <h3>🔬 Required Investigations</h3>
              <div className="investigation-list">
                {predictionData.investigations_needed &&
                predictionData.investigations_needed.length > 0 ? (
                  predictionData.investigations_needed.map((inv, idx) => (
                    <div key={idx} className="investigation-item">
                      <span className="check-icon">✓</span>
                      <span>{inv}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">
                    No specific investigations required at this time
                  </p>
                )}
              </div>
            </div>

            {predictionData.monitoring_plan &&
              predictionData.monitoring_plan.length > 0 && (
                <div className="card fefcon-monitoring">
                  <h3>📊 Monitoring Protocol</h3>
                  <div className="monitoring-list">
                    {predictionData.monitoring_plan.map((plan, idx) => (
                      <div key={idx} className="monitoring-item">
                        <span className="monitor-icon">📌</span>
                        <span>{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {predictionData.red_flags &&
              predictionData.red_flags.length > 0 && (
                <div className="card fefcon-redflags">
                  <h3>⚠️ Warning Signs</h3>
                  <div className="redflag-list">
                    {predictionData.red_flags.map((flag, idx) => (
                      <div key={idx} className="redflag-item">
                        <FaExclamationTriangle color="#c0392b" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="card fefcon-phase">
              <h3>📅 Disease Phase Analysis</h3>
              <div className="phase-info">
                <p>
                  <strong>Current Phase:</strong> Day{" "}
                  {patientData.episode.dayOfIllness} of Illness
                </p>
                {predictionData.prediction === "Dengue" && (
                  <>
                    {patientData.episode.dayOfIllness <= 3 && (
                      <div className="phase-detail febrile">
                        <h4>🔥 Febrile Phase (Day 1-3)</h4>
                        <p>- High fever, headache, body pain common</p>
                        <p>- Hydration is key - Monitor fluid intake/output</p>
                        <p>- Paracetamol for fever (avoid NSAIDs)</p>
                      </div>
                    )}
                    {patientData.episode.dayOfIllness > 3 &&
                      patientData.episode.dayOfIllness <= 7 && (
                        <div className="phase-detail critical">
                          <h4>⚠️ Critical Phase (Day 4-7)</h4>
                          <p>
                            - <strong>HIGH RISK PERIOD</strong> - Close
                            monitoring essential
                          </p>
                          <p>
                            - Watch for warning signs: Abdominal pain,
                            persistent vomiting, bleeding
                          </p>
                          <p>- CBC monitoring every 6-12 hours</p>
                          <p>
                            - Platelet &lt;100k or rapid drop = Admission
                            indicated
                          </p>
                        </div>
                      )}
                    {patientData.episode.dayOfIllness > 7 && (
                      <div className="phase-detail recovery">
                        <h4>✅ Recovery Phase (Day 8+)</h4>
                        <p>- Fever subsides, appetite returns</p>
                        <p>- Fluid reabsorption - Watch for fluid overload</p>
                        <p>- Ensure platelet &gt;100k before discharge</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SYMPTOMS TAB */}
        {activeTab === "symptoms" && patientData.symptoms && (
          <div className="symptoms-timeline">
            <h2>
              💊 Symptoms Timeline - Day {patientData.episode.dayOfIllness}
            </h2>

            <div className="current-symptoms-card card">
              <h3>Current Symptoms</h3>
              <div className="symptoms-grid">
                <div
                  className={`symptom-badge ${
                    patientData.symptoms.headache ? "present" : "absent"
                  }`}
                >
                  {patientData.symptoms.headache ? "✓" : "✗"} Headache
                </div>
                <div
                  className={`symptom-badge ${
                    patientData.symptoms.bodyPain ? "present" : "absent"
                  }`}
                >
                  {patientData.symptoms.bodyPain ? "✓" : "✗"} Body Pain
                </div>
                <div
                  className={`symptom-badge ${
                    patientData.symptoms.eyePain ? "present" : "absent"
                  }`}
                >
                  {patientData.symptoms.eyePain ? "✓" : "✗"} Eye Pain
                </div>
                <div
                  className={`symptom-badge ${
                    patientData.symptoms.rash ? "present" : "absent"
                  }`}
                >
                  {patientData.symptoms.rash ? "✓" : "✗"} Rash
                </div>
                <div
                  className={`symptom-badge ${
                    patientData.symptoms.vomiting ? "present" : "absent"
                  }`}
                >
                  {patientData.symptoms.vomiting ? "✓" : "✗"} Vomiting
                </div>
                <div
                  className={`symptom-badge ${
                    patientData.symptoms.bleeding ? "present" : "absent"
                  }`}
                >
                  {patientData.symptoms.bleeding ? "✓" : "✗"} Bleeding
                </div>
                <div
                  className={`symptom-badge ${
                    patientData.symptoms.abdominalPain ? "present" : "absent"
                  }`}
                >
                  {patientData.symptoms.abdominalPain ? "✓" : "✗"} Abdominal
                  Pain
                </div>
              </div>
            </div>

            <div className="observation-card card">
              <h3>Clinical Observations</h3>
              <div className="observation-grid">
                <div className="obs-item">
                  <span className="obs-label">Food Intake:</span>
                  <span
                    className={`obs-value ${patientData.symptoms.foodIntake}`}
                  >
                    {patientData.symptoms.foodIntake.toUpperCase()}
                  </span>
                </div>
                <div className="obs-item">
                  <span className="obs-label">Urine Output:</span>
                  <span
                    className={`obs-value ${patientData.symptoms.urineOutput}`}
                  >
                    {patientData.symptoms.urineOutput.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="history-container">
            <h2>
              <FaHistory /> Medical History
            </h2>

            <div className="card history-card">
              <h3>Patient Background</h3>
              <div className="history-grid">
                <div className="history-item">
                  <span className="history-label">Prior Antibiotics:</span>
                  <span
                    className={`history-value ${
                      patientData.history.priorAntibiotics ? "yes" : "no"
                    }`}
                  >
                    {patientData.history.priorAntibiotics ? "Yes ⚠️" : "No ✓"}
                  </span>
                </div>
                <div className="history-item">
                  <span className="history-label">Diabetes:</span>
                  <span
                    className={`history-value ${
                      patientData.history.hasDiabetes ? "yes" : "no"
                    }`}
                  >
                    {patientData.history.hasDiabetes ? "Yes ⚠️" : "No ✓"}
                  </span>
                </div>
                <div className="history-item">
                  <span className="history-label">Immunocompromised:</span>
                  <span
                    className={`history-value ${
                      patientData.history.immunocompromised ? "yes" : "no"
                    }`}
                  >
                    {patientData.history.immunocompromised ? "Yes ⚠️" : "No ✓"}
                  </span>
                </div>
                <div className="history-item">
                  <span className="history-label">Recent Travel:</span>
                  <span
                    className={`history-value ${
                      patientData.history.recentTravel ? "yes" : "no"
                    }`}
                  >
                    {patientData.history.recentTravel ? "Yes" : "No"}
                  </span>
                </div>
                <div className="history-item">
                  <span className="history-label">Mosquito Exposure:</span>
                  <span
                    className={`history-value ${
                      patientData.history.mosquitoExposure ? "yes" : "no"
                    }`}
                  >
                    {patientData.history.mosquitoExposure ? "Yes 🦟" : "No"}
                  </span>
                </div>
                <div className="history-item">
                  <span className="history-label">Fever Pattern:</span>
                  <span className="history-value">
                    {patientData.history.feverPattern.toUpperCase()}
                  </span>
                </div>
                <div className="history-item full-width">
                  <span className="history-label">
                    Highest Temperature Recorded:
                  </span>
                  <span className="history-value temp">
                    {patientData.history.highestTemperature}°F
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClinicianAIAnalysis;
