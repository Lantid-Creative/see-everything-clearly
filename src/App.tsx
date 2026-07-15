import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";

import { SiteLayout } from "@/components/site/SiteLayout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Industries from "./pages/Industries";
import Company from "./pages/Company";
import CaseStudy from "./pages/CaseStudy";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import PciDss from "./pages/PciDss";
import VaptLanding from "./pages/vapt/VaptLanding";
import VaptRequest from "./pages/vapt/VaptRequest";

import VerifyReport from "./pages/vapt/VerifyReport";
import AdminVapt from "./pages/vapt/AdminVapt";
import AdminPci from "./pages/vapt/AdminPci";
import AdminAudits from "./pages/vapt/AdminAudits";
import PaymentCallback from "./pages/vapt/PaymentCallback";
import AuditHub from "./pages/AuditHub";
import AuditService from "./pages/audits/AuditService";
import MyAudits from "./pages/audits/MyAudits";
import EngagementDetail from "./pages/audits/EngagementDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/industries" element={<Industries />} />
                <Route path="/company" element={<Company />} />
                <Route path="/case-study" element={<CaseStudy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pci-dss" element={<PciDss />} />
                <Route path="/audits" element={<AuditHub />} />
                <Route path="/audits/my" element={<MyAudits />} />
                <Route path="/audits/my/:type/:id" element={<EngagementDetail />} />
                <Route path="/audits/:slug" element={<AuditService />} />
                <Route path="/vapt" element={<VaptLanding />} />
                <Route path="/vapt/request" element={<VaptRequest />} />
                <Route path="/vapt/dashboard" element={<Navigate to="/audits/my" replace />} />
                <Route path="/vapt/payment-callback" element={<PaymentCallback />} />
                <Route path="/verify-report" element={<VerifyReport />} />
                <Route path="/verify-report/:code" element={<VerifyReport />} />
                <Route path="/admin/vapt" element={<AdminVapt />} />
                <Route path="/admin/pci-dss" element={<AdminPci />} />
                <Route path="/admin/audits" element={<AdminAudits />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/app" element={<Navigate to="/audits" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
