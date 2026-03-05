import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { ChildLayout } from "@/components/layouts/ChildLayout";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentTasks from "./pages/parent/ParentTasks";
import ParentAllowance from "./pages/parent/ParentAllowance";
import ParentReports from "./pages/parent/ParentReports";
import ChildDashboard from "./pages/child/ChildDashboard";
import ChildWallet from "./pages/child/ChildWallet";
import ChildMissions from "./pages/child/ChildMissions";
import ChildVaults from "./pages/child/ChildVaults";
import ChildAchievements from "./pages/child/ChildAchievements";
import ChildStore from "./pages/child/ChildStore";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user.role === 'parent') {
    return (
      <Routes>
        <Route path="/parent" element={<ParentLayout><ParentDashboard /></ParentLayout>} />
        <Route path="/parent/children" element={<ParentLayout><ParentChildren /></ParentLayout>} />
        <Route path="/parent/tasks" element={<ParentLayout><ParentTasks /></ParentLayout>} />
        <Route path="/parent/allowance" element={<ParentLayout><ParentAllowance /></ParentLayout>} />
        <Route path="/parent/reports" element={<ParentLayout><ParentReports /></ParentLayout>} />
        <Route path="*" element={<Navigate to="/parent" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/child" element={<ChildLayout><ChildDashboard /></ChildLayout>} />
      <Route path="/child/wallet" element={<ChildLayout><ChildWallet /></ChildLayout>} />
      <Route path="/child/missions" element={<ChildLayout><ChildMissions /></ChildLayout>} />
      <Route path="/child/vaults" element={<ChildLayout><ChildVaults /></ChildLayout>} />
      <Route path="/child/achievements" element={<ChildLayout><ChildAchievements /></ChildLayout>} />
      <Route path="/child/store" element={<ChildLayout><ChildStore /></ChildLayout>} />
      <Route path="*" element={<Navigate to="/child" replace />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
