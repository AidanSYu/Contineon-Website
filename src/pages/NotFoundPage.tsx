import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BlueprintGrid } from '@/components/effects';
import { NoIndex } from '@/components/Seo';

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-6 text-center text-ink">
      <NoIndex title="Page not found, Contineon" />
      <BlueprintGrid />
      <div className="relative z-10">
        <p className="lab-label text-safety">ERROR 404, OFF GRID</p>
        <h1 className="mt-4 font-display text-6xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-muted">
          The page you’re looking for doesn’t exist or has drifted off the grid.
        </p>
        <Button asChild className="mt-8 bg-safety text-white hover:bg-safety/90">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
