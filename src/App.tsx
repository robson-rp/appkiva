import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { ChildLayout } from "@/components/layouts/ChildLayout";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { TeenLayout } from "@/components/layouts/TeenLayout";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentTasks from "./pages/parent/ParentTasks";
import ParentAllowance from "./pages/parent/ParentAllowance";
import ParentReports from "./pages/parent/ParentReports";
import ParentProfile from "./pages/parent/ParentProfile";
import ParentRewards from "./pages/parent/ParentRewards";
import ChildDashboard from "./pages/child/ChildDashboard";
import ChildWallet from "./pages/child/ChildWallet";
import ChildMissions from "./pages/child/ChildMissions";
import ChildVaults from "./pages/child/ChildVaults";
import ChildAchievements from "./pages/child/ChildAchievements";
import ChildStore from "./pages/child/ChildStore";
import ChildDiary from "./pages/child/ChildDiary";
import ChildDreams from "./pages/child/ChildDreams";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherChallenges from "./pages/teacher/TeacherChallenges";
import TeenDashboard from "./pages/teen/TeenDashboard";
import TeenWallet from "./pages/teen/TeenWallet";
import TeenMissions from "./pages/teen/TeenMissions";
import TeenVaults from "./pages/teen/TeenVaults";
import TeenAnalytics from "./pages/teen/TeenAnalytics";
import LearnPage from "./pages/shared/LearnPage";
import BadgesPage from "./pages/shared/BadgesPage";

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
        <Route path="/parent/rewards" element={<ParentLayout><ParentRewards /></ParentLayout>} />
        <Route path="/parent/profile" element={<ParentLayout><ParentProfile /></ParentLayout>} />
        <Route path="*" element={<Navigate to="/parent" replace />} />
      </Routes>
    );
  }

  if (user.role === 'teacher') {
    return (
      <Routes>
        <Route path="/teacher" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
        <Route path="/teacher/classes" element={<TeacherLayout><TeacherClasses /></TeacherLayout>} />
        <Route path="/teacher/challenges" element={<TeacherLayout><TeacherChallenges /></TeacherLayout>} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    );
  }

  if (user.role === 'teen') {
    return (
      <Routes>
        <Route path="/teen" element={<TeenLayout><TeenDashboard /></TeenLayout>} />
        <Route path="/teen/wallet" element={<TeenLayout><TeenWallet /></TeenLayout>} />
        <Route path="/teen/missions" element={<TeenLayout><TeenMissions /></TeenLayout>} />
        <Route path="/teen/vaults" element={<TeenLayout><TeenVaults /></TeenLayout>} />
        <Route path="/teen/analytics" element={<TeenLayout><TeenAnalytics /></TeenLayout>} />
        <Route path="/teen/learn" element={<TeenLayout><LearnPage /></TeenLayout>} />
        <Route path="/teen/badges" element={<TeenLayout><BadgesPage /></TeenLayout>} />
        <Route path="*" element={<Navigate to="/teen" replace />} />
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
      <Route path="/child/badges" element={<ChildLayout><BadgesPage /></ChildLayout>} />
      <Route path="/child/store" element={<ChildLayout><ChildStore /></ChildLayout>} />
      <Route path="/child/diary" element={<ChildLayout><ChildDiary /></ChildLayout>} />
      <Route path="/child/dreams" element={<ChildLayout><ChildDreams /></ChildLayout>} />
      <Route path="/child/learn" element={<ChildLayout><LearnPage /></ChildLayout>} />
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
