import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Chatbot from "./pages/Chatbot";
import SymptomLog from "./pages/SymptomLog";
import DeviceSetup from "./pages/DeviceSetup";
import Heatmap from "./pages/Heatmap";
import NotFound from "./pages/NotFound";
import AITesting from "./components/AITesting";
import PatientLogin from "./pages/PatientLogin";
import ClinicianLogin from "./pages/ClinicianLogin";
import PatientSignup from "./pages/PatientSignup";
import ClinicianSignup from "./pages/ClinicianSignup";
import PatientDashboardd from "./pages/PatientDashboardd";
import AdvancedAI from "./components/AdvancedAI";
import ClinicianDashboardd from "./pages/ClinicianDashboardd";
import PatientDetailVieww from "./pages/PatientDetailVieww";
import ClinicianAIAnalysis from "./pages/ClinicianAIAnalysis";
import PatientMedicalHistory from "./pages/PatientMedicalHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup-patient" element={<PatientSignup />} />
          <Route path="/signin-patient" element={<PatientLogin />} />
          <Route path="/signup-clinician" element={<ClinicianSignup />} />
          <Route path="/signin-clinician" element={<ClinicianLogin />} />
          <Route path="/patient-dashboard" element={<PatientDashboardd />} />
          <Route
            path="/clinician-dashboard"
            element={<ClinicianDashboardd />}
          />
          <Route path="/patient-history" element={<PatientMedicalHistory />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/symptom-log" element={<SymptomLog />} />
          <Route path="/device-setup" element={<DeviceSetup />} />
          <Route
            path="/clinician/patientt/:patientId"
            element={<PatientDetailVieww />}
          />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/ai-test" element={<AITesting />} />
          <Route path="/adv" element={<AdvancedAI />} />
          <Route
            path="/clinician/patient/:patientId/ai-analysis"
            element={<ClinicianAIAnalysis />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
