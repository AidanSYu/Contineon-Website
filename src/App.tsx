import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';

import { flags } from '@/lib/flags';
import { Spinner } from '@/components/ui/spinner';

/* Route-level code splitting, including route chrome and access guards. Keeping
   these boundaries out of the entry chunk prevents marketing visitors from
   parsing dashboard/auth/Asilia code they do not use. */
const MarketingLayout = lazy(() =>
  import('@/components/layout/MarketingLayout').then((m) => ({ default: m.MarketingLayout })),
);
const AsiliaLayout = lazy(() =>
  import('@/components/layout/AsiliaLayout').then((m) => ({ default: m.AsiliaLayout })),
);
const AuthLayout = lazy(() =>
  import('@/components/layout/AuthLayout').then((m) => ({ default: m.AuthLayout })),
);
const DashboardLayout = lazy(() =>
  import('@/components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
);
const RequireAuth = lazy(() =>
  import('@/components/auth/RequireAuth').then((m) => ({ default: m.RequireAuth })),
);
const RequireAdmin = lazy(() =>
  import('@/components/auth/RequireAdmin').then((m) => ({ default: m.RequireAdmin })),
);
const ComingSoonPage = lazy(() =>
  import('@/pages/marketing/ComingSoonPage').then((m) => ({ default: m.ComingSoonPage })),
);

const LandingPage = lazy(() =>
  import('@/pages/marketing/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const ContactPage = lazy(() =>
  import('@/pages/marketing/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const TermsPage = lazy(() =>
  import('@/pages/marketing/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/marketing/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
const FaqPage = lazy(() => import('@/pages/marketing/FaqPage').then((m) => ({ default: m.FaqPage })));
const SecurityPage = lazy(() =>
  import('@/pages/marketing/SecurityPage').then((m) => ({ default: m.SecurityPage })),
);
const MissionPage = lazy(() =>
  import('@/pages/marketing/MissionPage').then((m) => ({ default: m.MissionPage })),
);
const AsiliaPage = lazy(() =>
  import('@/pages/marketing/AsiliaPage').then((m) => ({ default: m.AsiliaPage })),
);
const AsiliaFrameworkPage = lazy(() =>
  import('@/pages/marketing/asilia/FrameworkPage').then((m) => ({ default: m.AsiliaFrameworkPage })),
);
const AsiliaSdkPage = lazy(() =>
  import('@/pages/marketing/asilia/SdkPage').then((m) => ({ default: m.AsiliaSdkPage })),
);
const AsiliaDocsPage = lazy(() =>
  import('@/pages/marketing/asilia/DocsPage').then((m) => ({ default: m.AsiliaDocsPage })),
);
const AsiliaNewsPage = lazy(() =>
  import('@/pages/marketing/asilia/NewsPage').then((m) => ({ default: m.AsiliaNewsPage })),
);
const DocsPage = lazy(() => import('@/pages/marketing/DocsPage').then((m) => ({ default: m.DocsPage })));
const BlogPage = lazy(() => import('@/pages/marketing/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() =>
  import('@/pages/marketing/BlogPostPage').then((m) => ({ default: m.BlogPostPage })),
);
const ChangelogPage = lazy(() =>
  import('@/pages/marketing/ChangelogPage').then((m) => ({ default: m.ChangelogPage })),
);

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() =>
  import('@/pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);

const OverviewPage = lazy(() =>
  import('@/pages/app/OverviewPage').then((m) => ({ default: m.OverviewPage })),
);
const ProjectsPage = lazy(() =>
  import('@/pages/app/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/app/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const EscrowListPage = lazy(() =>
  import('@/pages/app/EscrowListPage').then((m) => ({ default: m.EscrowListPage })),
);
const EscrowDetailPage = lazy(() =>
  import('@/pages/app/EscrowDetailPage').then((m) => ({ default: m.EscrowDetailPage })),
);
const AdminEscrowPage = lazy(() =>
  import('@/pages/app/admin/AdminEscrowPage').then((m) => ({ default: m.AdminEscrowPage })),
);

const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner className="size-6 text-ink-muted" />
    </div>
  );
}

/** Preserve the slug when redirecting legacy /blog/:slug → /news/:slug. */
function NewsSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/news/${slug ?? ''}`} replace />;
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public marketing */}
        <Route element={<MarketingLayout />}>
          <Route index element={<LandingPage />} />

          {/* Technology — dropdown pillars, placeholders for now */}
          <Route
            path="technology/foundation-models"
            element={
              <ComingSoonPage
                title="Foundation Models"
                description="The foundational models that reason about experiments: they propose the run, read the result, and decide what comes next."
              />
            }
          />
          <Route
            path="technology/autonomous-discovery"
            element={
              <ComingSoonPage
                title="Autonomous Discovery"
                description="Research that pushes past the Asilia product into open-ended, self-directed scientific discovery."
              />
            }
          />

          {/* Company */}
          <Route path="mission" element={<MissionPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="contact" element={<ContactPage />} />

          {/* News */}
          <Route path="news" element={<BlogPage />} />
          <Route path="news/:slug" element={<BlogPostPage />} />

          {/* Utility */}
          <Route path="docs" element={<DocsPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="changelog" element={<ChangelogPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />

          {/* Legacy redirects */}
          <Route path="about" element={<Navigate to="/mission" replace />} />
          <Route path="blog" element={<Navigate to="/news" replace />} />
          <Route path="blog/:slug" element={<NewsSlugRedirect />} />
          <Route path="platform" element={<Navigate to="/asilia" replace />} />
        </Route>

        {/* Asilia — standalone product site with its own chrome (like
            antigravity.google next to google.com). The whole tree lives under
            /asilia so it can lift to asilia.contineon.com later with a 301. */}
        <Route path="asilia" element={<AsiliaLayout />}>
          <Route index element={<AsiliaPage />} />
          <Route path="framework" element={<AsiliaFrameworkPage />} />
          <Route path="sdk" element={<AsiliaSdkPage />} />
          <Route path="docs" element={<AsiliaDocsPage />} />
          <Route path="news" element={<AsiliaNewsPage />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={flags.publicSignup ? <SignupPage /> : <Navigate to="/contact?topic=partner" replace />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Authenticated app (no self-serve billing, access is provisioned) */}
        <Route element={<RequireAuth />}>
          <Route path="app" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="escrow" element={<EscrowListPage />} />
            <Route path="escrow/:id" element={<EscrowDetailPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="admin/escrow" element={<AdminEscrowPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
