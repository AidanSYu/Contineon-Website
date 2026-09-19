import { Outlet } from 'react-router-dom';
import { GrainOverlay, BlueprintGrid } from '@/components/effects';
import { AuthAside } from '@/components/auth/AuthAside';
import { NoIndex } from '@/components/Seo';
import { Logo } from './Logo';

/** Two-column shell for auth pages: form on the left, cinematic aside on the right. */
export function AuthLayout() {
  return (
    <div className="relative grid min-h-screen bg-paper text-ink lg:grid-cols-2">
      <NoIndex title="Secure access, Contineon" />
      <GrainOverlay />

      {/* Left, brand + form */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-12">
        <BlueprintGrid />
        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2">
            <Logo className="text-2xl" />
            <span className="lab-label">Secure access</span>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right, cinematic aside (hidden below lg) */}
      <AuthAside />
    </div>
  );
}
