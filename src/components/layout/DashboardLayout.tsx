import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  Menu,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { NoIndex } from '@/components/Seo';
import { getMyProfile } from '@/lib/api/profiles';
import { useAuth } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NAV = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban, end: false },
  // Escrow powers design-partner pilot engagements, surfaced as "Engagement".
  // Available to every authenticated user (not subscription-gated).
  { to: '/app/escrow', label: 'Engagement', icon: Landmark, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
];

/** Authenticated dashboard shell: sidebar nav + content area. */
export function DashboardLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NoIndex title="Dashboard, Contineon" />
      <DashboardShell />
    </QueryClientProvider>
  );
}

function DashboardShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Shared ['profile'] cache key with RequireAdmin / SettingsPage (no extra fetch).
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getMyProfile });
  const isAdmin = profile?.role === 'admin';
  // The conditional Admin link is cosmetic; RequireAdmin + the edge-function
  // is_admin gate enforce real access.
  const nav = isAdmin
    ? [...NAV, { to: '/app/admin/escrow', label: 'Admin', icon: ShieldCheck, end: false }]
    : NAV;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  };

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-line px-6">
        <Logo className="text-base" to="/app" />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-panel font-medium text-ink'
                  : 'text-ink-muted hover:bg-panel/60 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'h-3.5 w-px',
                    isActive ? 'bg-safety' : 'bg-transparent',
                  )}
                />
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="truncate px-3 pb-2 font-mono-tech text-[11px] text-ink-faint">{user?.email}</div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-panel/60 hover:text-ink"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.6} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:block">
        {SidebarBody}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-surface lg:hidden">
            {SidebarBody}
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/95 px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6 text-ink" />
          </button>
          <div className="lg:hidden">
            <Logo className="text-base" to="/app" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/"
              className="font-mono-tech text-[11px] uppercase tracking-[0.15em] text-ink-muted hover:text-ink"
            >
              View site ↗
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
