import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { ChildLayout } from "@/components/layouts/ChildLayout";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { TeenLayout } from "@/components/layouts/TeenLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PartnerLayout } from "@/components/layouts/PartnerLayout";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";
import { InstallPWAPrompt } from "./components/InstallPWAPrompt";
import { OfflineBanner } from "./components/OfflineBanner";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentTasks from "./pages/parent/ParentTasks";
import ParentAllowance from "./pages/parent/ParentAllowance";
import ParentReports from "./pages/parent/ParentReports";
import ParentProfile from "./pages/parent/ParentProfile";
import ParentRewards from "./pages/parent/ParentRewards";
import ParentVaults from "./pages/parent/ParentVaults";
import ParentSubscription from "./pages/parent/ParentSubscription";
import ParentConsent from "./pages/parent/ParentConsent";
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
import TeacherStudentProfile from "./pages/teacher/TeacherStudentProfile";
import TeacherSchoolProfile from "./pages/teacher/TeacherSchoolProfile";
import TeenDashboard from "./pages/teen/TeenDashboard";
import TeenWallet from "./pages/teen/TeenWallet";
import TeenMissions from "./pages/teen/TeenMissions";
import TeenVaults from "./pages/teen/TeenVaults";
import TeenAnalytics from "./pages/teen/TeenAnalytics";
import LearnPage from "./pages/shared/LearnPage";
import BadgesPage from "./pages/shared/BadgesPage";
import StreaksPage from "./pages/shared/StreaksPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTenants from "./pages/admin/AdminTenants";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminCurrencies from "./pages/admin/AdminCurrencies";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminRisk from "./pages/admin/AdminRisk";
import AdminCompliance from "./pages/admin/AdminCompliance";
import AdminSchools from "./pages/admin/AdminSchools";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLessons from "./pages/admin/AdminLessons";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerPrograms from "./pages/partner/PartnerPrograms";
import PartnerChallenges from "./pages/partner/PartnerChallenges";
import PartnerReports from "./pages/partner/PartnerReports";
import PartnerProfile from "./pages/partner/PartnerProfile";
import PartnerSubscriptionPage from "./pages/partner/PartnerSubscription";
import AcceptProgramInvite from "./pages/shared/AcceptProgramInvite";

const queryClient = new QueryClient();

const INVITE_ROUTE = <Route path="/invite/program/:code" element={<AcceptProgramInvite />} />;
const INSTALL_ROUTE = <Route path="/install" element={<Install />} />;

function renderRoutes(user: { role: string }) {
  if (user.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/tenants" element={<AdminLayout><AdminTenants /></AdminLayout>} />
        <Route path="/admin/subscriptions" element={<AdminLayout><AdminSubscriptions /></AdminLayout>} />
        <Route path="/admin/currencies" element={<AdminLayout><AdminCurrencies /></AdminLayout>} />
        <Route path="/admin/audit" element={<AdminLayout><AdminAudit /></AdminLayout>} />
        <Route path="/admin/risk" element={<AdminLayout><AdminRisk /></AdminLayout>} />
        <Route path="/admin/compliance" element={<AdminLayout><AdminCompliance /></AdminLayout>} />
        <Route path="/admin/schools" element={<AdminLayout><AdminSchools /></AdminLayout>} />
        <Route path="/admin/finance" element={<AdminLayout><AdminFinance /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
        <Route path="/admin/lessons" element={<AdminLayout><AdminLessons /></AdminLayout>} />
        {INSTALL_ROUTE}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  if (user.role === 'partner') {
    return (
      <Routes>
        <Route path="/partner" element={<PartnerLayout><PartnerDashboard /></PartnerLayout>} />
        <Route path="/partner/programs" element={<PartnerLayout><PartnerPrograms /></PartnerLayout>} />
        <Route path="/partner/challenges" element={<PartnerLayout><PartnerChallenges /></PartnerLayout>} />
        <Route path="/partner/reports" element={<PartnerLayout><PartnerReports /></PartnerLayout>} />
        <Route path="/partner/subscription" element={<PartnerLayout><PartnerSubscriptionPage /></PartnerLayout>} />
        <Route path="/partner/profile" element={<PartnerLayout><PartnerProfile /></PartnerLayout>} />
        {INSTALL_ROUTE}
        <Route path="*" element={<Navigate to="/partner" replace />} />
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
        <Route path="/parent/vaults" element={<ParentLayout><ParentVaults /></ParentLayout>} />
        <Route path="/parent/rewards" element={<ParentLayout><ParentRewards /></ParentLayout>} />
        <Route path="/parent/profile" element={<ParentLayout><ParentProfile /></ParentLayout>} />
        <Route path="/parent/subscription" element={<ParentLayout><ParentSubscription /></ParentLayout>} />
        <Route path="/parent/consent" element={<ParentLayout><ParentConsent /></ParentLayout>} />
        {INVITE_ROUTE}
        {INSTALL_ROUTE}
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
        <Route path="/teacher/student/:studentId" element={<TeacherLayout><TeacherStudentProfile /></TeacherLayout>} />
        <Route path="/teacher/school" element={<TeacherLayout><TeacherSchoolProfile /></TeacherLayout>} />
        {INVITE_ROUTE}
        {INSTALL_ROUTE}
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
        <Route path="/teen/streaks" element={<TeenLayout><StreaksPage /></TeenLayout>} />
        {INSTALL_ROUTE}
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
      <Route path="/child/streaks" element={<ChildLayout><StreaksPage /></ChildLayout>} />
      <Route path="/child/store" element={<ChildLayout><ChildStore /></ChildLayout>} />
      <Route path="/child/diary" element={<ChildLayout><ChildDiary /></ChildLayout>} />
      <Route path="/child/dreams" element={<ChildLayout><ChildDreams /></ChildLayout>} />
      <Route path="/child/learn" element={<ChildLayout><LearnPage /></ChildLayout>} />
      {INSTALL_ROUTE}
      <Route path="*" element={<Navigate to="/child" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="min-h-screen flex items-center justify-center"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </motion.div>
      ) : !user ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <InstallPWAPrompt />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      ) : (
        <motion.div
          key={`dashboard-${user.role}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <InstallPWAPrompt />
          {renderRoutes(user)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OfflineBanner />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
