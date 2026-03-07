import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { InstallPWAPrompt } from "./components/InstallPWAPrompt";
import { OfflineBanner } from "./components/OfflineBanner";
import { RewardAnimationProvider } from "./contexts/RewardAnimationContext";

// Layouts (kept eager – small and always needed)
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { ChildLayout } from "@/components/layouts/ChildLayout";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { TeenLayout } from "@/components/layouts/TeenLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PartnerLayout } from "@/components/layouts/PartnerLayout";

// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Install = lazy(() => import("./pages/Install"));

// Parent
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const ParentChildren = lazy(() => import("./pages/parent/ParentChildren"));
const ParentTasks = lazy(() => import("./pages/parent/ParentTasks"));
const ParentAllowance = lazy(() => import("./pages/parent/ParentAllowance"));
const ParentReports = lazy(() => import("./pages/parent/ParentReports"));
const ParentProfile = lazy(() => import("./pages/parent/ParentProfile"));
const ParentRewards = lazy(() => import("./pages/parent/ParentRewards"));
const ParentVaults = lazy(() => import("./pages/parent/ParentVaults"));
const ParentSubscription = lazy(() => import("./pages/parent/ParentSubscription"));
const ParentConsent = lazy(() => import("./pages/parent/ParentConsent"));

// Child
const ChildDashboard = lazy(() => import("./pages/child/ChildDashboard"));
const ChildWallet = lazy(() => import("./pages/child/ChildWallet"));
const ChildMissions = lazy(() => import("./pages/child/ChildMissions"));
const ChildTasks = lazy(() => import("./pages/child/ChildTasks"));
const ChildVaults = lazy(() => import("./pages/child/ChildVaults"));
const ChildAchievements = lazy(() => import("./pages/child/ChildAchievements"));
const ChildStore = lazy(() => import("./pages/child/ChildStore"));
const ChildDiary = lazy(() => import("./pages/child/ChildDiary"));
const ChildDreams = lazy(() => import("./pages/child/ChildDreams"));
const ChildProfile = lazy(() => import("./pages/child/ChildProfile"));

// Teacher
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherClasses = lazy(() => import("./pages/teacher/TeacherClasses"));
const TeacherChallenges = lazy(() => import("./pages/teacher/TeacherChallenges"));
const TeacherStudentProfile = lazy(() => import("./pages/teacher/TeacherStudentProfile"));
const TeacherSchoolProfile = lazy(() => import("./pages/teacher/TeacherSchoolProfile"));

// Teen
const TeenDashboard = lazy(() => import("./pages/teen/TeenDashboard"));
const TeenWallet = lazy(() => import("./pages/teen/TeenWallet"));
const TeenMissions = lazy(() => import("./pages/teen/TeenMissions"));
const TeenTasks = lazy(() => import("./pages/teen/TeenTasks"));
const TeenVaults = lazy(() => import("./pages/teen/TeenVaults"));
const TeenAnalytics = lazy(() => import("./pages/teen/TeenAnalytics"));
const TeenProfile = lazy(() => import("./pages/teen/TeenProfile"));

// Shared
const LearnPage = lazy(() => import("./pages/shared/LearnPage"));
const BadgesPage = lazy(() => import("./pages/shared/BadgesPage"));
const StreaksPage = lazy(() => import("./pages/shared/StreaksPage"));
const AcceptProgramInvite = lazy(() => import("./pages/shared/AcceptProgramInvite"));
const JoinFamily = lazy(() => import("./pages/shared/JoinFamily"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTenants = lazy(() => import("./pages/admin/AdminTenants"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminCurrencies = lazy(() => import("./pages/admin/AdminCurrencies"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminRisk = lazy(() => import("./pages/admin/AdminRisk"));
const AdminCompliance = lazy(() => import("./pages/admin/AdminCompliance"));
const AdminSchools = lazy(() => import("./pages/admin/AdminSchools"));
const AdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminLessons = lazy(() => import("./pages/admin/AdminLessons"));
const AdminOnboarding = lazy(() => import("./pages/admin/AdminOnboarding"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));

// Partner
const PartnerDashboard = lazy(() => import("./pages/partner/PartnerDashboard"));
const PartnerPrograms = lazy(() => import("./pages/partner/PartnerPrograms"));
const PartnerChallenges = lazy(() => import("./pages/partner/PartnerChallenges"));
const PartnerReports = lazy(() => import("./pages/partner/PartnerReports"));
const PartnerProfile = lazy(() => import("./pages/partner/PartnerProfile"));
const PartnerSubscriptionPage = lazy(() => import("./pages/partner/PartnerSubscription"));

const queryClient = new QueryClient();

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="A carregar">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  );
}

const INVITE_ROUTE = <Route path="/invite/program/:code" element={<Suspense fallback={<LazyFallback />}><AcceptProgramInvite /></Suspense>} />;
const INSTALL_ROUTE = <Route path="/install" element={<Suspense fallback={<LazyFallback />}><Install /></Suspense>} />;

function renderRoutes(user: { role: string }) {
  const S = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<LazyFallback />}>{children}</Suspense>
  );

  if (user.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout><S><AdminDashboard /></S></AdminLayout>} />
        <Route path="/admin/tenants" element={<AdminLayout><S><AdminTenants /></S></AdminLayout>} />
        <Route path="/admin/subscriptions" element={<AdminLayout><S><AdminSubscriptions /></S></AdminLayout>} />
        <Route path="/admin/currencies" element={<AdminLayout><S><AdminCurrencies /></S></AdminLayout>} />
        <Route path="/admin/audit" element={<AdminLayout><S><AdminAudit /></S></AdminLayout>} />
        <Route path="/admin/risk" element={<AdminLayout><S><AdminRisk /></S></AdminLayout>} />
        <Route path="/admin/compliance" element={<AdminLayout><S><AdminCompliance /></S></AdminLayout>} />
        <Route path="/admin/schools" element={<AdminLayout><S><AdminSchools /></S></AdminLayout>} />
        <Route path="/admin/finance" element={<AdminLayout><S><AdminFinance /></S></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><S><AdminUsers /></S></AdminLayout>} />
        <Route path="/admin/lessons" element={<AdminLayout><S><AdminLessons /></S></AdminLayout>} />
        <Route path="/admin/onboarding" element={<AdminLayout><S><AdminOnboarding /></S></AdminLayout>} />
        <Route path="/admin/notifications" element={<AdminLayout><S><AdminNotifications /></S></AdminLayout>} />
        {INSTALL_ROUTE}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  if (user.role === 'partner') {
    return (
      <Routes>
        <Route path="/partner" element={<PartnerLayout><S><PartnerDashboard /></S></PartnerLayout>} />
        <Route path="/partner/programs" element={<PartnerLayout><S><PartnerPrograms /></S></PartnerLayout>} />
        <Route path="/partner/challenges" element={<PartnerLayout><S><PartnerChallenges /></S></PartnerLayout>} />
        <Route path="/partner/reports" element={<PartnerLayout><S><PartnerReports /></S></PartnerLayout>} />
        <Route path="/partner/subscription" element={<PartnerLayout><S><PartnerSubscriptionPage /></S></PartnerLayout>} />
        <Route path="/partner/profile" element={<PartnerLayout><S><PartnerProfile /></S></PartnerLayout>} />
        {INSTALL_ROUTE}
        <Route path="*" element={<Navigate to="/partner" replace />} />
      </Routes>
    );
  }

  if (user.role === 'parent') {
    return (
      <Routes>
        <Route path="/parent" element={<ParentLayout><S><ParentDashboard /></S></ParentLayout>} />
        <Route path="/parent/children" element={<ParentLayout><S><ParentChildren /></S></ParentLayout>} />
        <Route path="/parent/tasks" element={<ParentLayout><S><ParentTasks /></S></ParentLayout>} />
        <Route path="/parent/allowance" element={<ParentLayout><S><ParentAllowance /></S></ParentLayout>} />
        <Route path="/parent/reports" element={<ParentLayout><S><ParentReports /></S></ParentLayout>} />
        <Route path="/parent/vaults" element={<ParentLayout><S><ParentVaults /></S></ParentLayout>} />
        <Route path="/parent/rewards" element={<ParentLayout><S><ParentRewards /></S></ParentLayout>} />
        <Route path="/parent/profile" element={<ParentLayout><S><ParentProfile /></S></ParentLayout>} />
        <Route path="/parent/subscription" element={<ParentLayout><S><ParentSubscription /></S></ParentLayout>} />
        <Route path="/parent/consent" element={<ParentLayout><S><ParentConsent /></S></ParentLayout>} />
        {INVITE_ROUTE}
        {INSTALL_ROUTE}
        <Route path="*" element={<Navigate to="/parent" replace />} />
      </Routes>
    );
  }

  if (user.role === 'teacher') {
    return (
      <Routes>
        <Route path="/teacher" element={<TeacherLayout><S><TeacherDashboard /></S></TeacherLayout>} />
        <Route path="/teacher/classes" element={<TeacherLayout><S><TeacherClasses /></S></TeacherLayout>} />
        <Route path="/teacher/challenges" element={<TeacherLayout><S><TeacherChallenges /></S></TeacherLayout>} />
        <Route path="/teacher/student/:studentId" element={<TeacherLayout><S><TeacherStudentProfile /></S></TeacherLayout>} />
        <Route path="/teacher/school" element={<TeacherLayout><S><TeacherSchoolProfile /></S></TeacherLayout>} />
        {INVITE_ROUTE}
        {INSTALL_ROUTE}
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    );
  }

  if (user.role === 'teen') {
    return (
      <Routes>
        <Route path="/teen" element={<TeenLayout><S><TeenDashboard /></S></TeenLayout>} />
        <Route path="/teen/wallet" element={<TeenLayout><S><TeenWallet /></S></TeenLayout>} />
        <Route path="/teen/missions" element={<TeenLayout><S><TeenMissions /></S></TeenLayout>} />
        <Route path="/teen/vaults" element={<TeenLayout><S><TeenVaults /></S></TeenLayout>} />
        <Route path="/teen/analytics" element={<TeenLayout><S><TeenAnalytics /></S></TeenLayout>} />
        <Route path="/teen/learn" element={<TeenLayout><S><LearnPage /></S></TeenLayout>} />
        <Route path="/teen/badges" element={<TeenLayout><S><BadgesPage /></S></TeenLayout>} />
        <Route path="/teen/streaks" element={<TeenLayout><S><StreaksPage /></S></TeenLayout>} />
        <Route path="/teen/profile" element={<TeenLayout><S><TeenProfile /></S></TeenLayout>} />
        {INSTALL_ROUTE}
        <Route path="*" element={<Navigate to="/teen" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/child" element={<ChildLayout><S><ChildDashboard /></S></ChildLayout>} />
      <Route path="/child/wallet" element={<ChildLayout><S><ChildWallet /></S></ChildLayout>} />
      <Route path="/child/missions" element={<ChildLayout><S><ChildMissions /></S></ChildLayout>} />
      <Route path="/child/vaults" element={<ChildLayout><S><ChildVaults /></S></ChildLayout>} />
      <Route path="/child/achievements" element={<ChildLayout><S><ChildAchievements /></S></ChildLayout>} />
      <Route path="/child/badges" element={<ChildLayout><S><BadgesPage /></S></ChildLayout>} />
      <Route path="/child/streaks" element={<ChildLayout><S><StreaksPage /></S></ChildLayout>} />
      <Route path="/child/store" element={<ChildLayout><S><ChildStore /></S></ChildLayout>} />
      <Route path="/child/diary" element={<ChildLayout><S><ChildDiary /></S></ChildLayout>} />
      <Route path="/child/dreams" element={<ChildLayout><S><ChildDreams /></S></ChildLayout>} />
        <Route path="/child/learn" element={<ChildLayout><S><LearnPage /></S></ChildLayout>} />
        <Route path="/child/profile" element={<ChildLayout><S><ChildProfile /></S></ChildLayout>} />
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
          role="status"
          aria-label="A carregar aplicação"
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
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/join/:code" element={<JoinFamily />} />
              <Route path="/install" element={<Install />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
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
            <RewardAnimationProvider>
              {/* Skip-to-content link for keyboard users */}
              <a href="#main-content" className="skip-to-content">
                Saltar para o conteúdo
              </a>
              <OfflineBanner />
              <AppRoutes />
            </RewardAnimationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
