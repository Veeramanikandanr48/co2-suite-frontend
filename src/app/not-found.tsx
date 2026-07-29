import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CloudOff, ArrowLeft, LayoutDashboard, LayoutGrid } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-background text-foreground relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* Animated Visual Badge */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-xl">
          <CloudOff className="w-12 h-12" />
        </div>

        {/* 404 Header & Message */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-500/20">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Lost in the Atmosphere?
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            The page you are searching for might have been removed, renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-5 py-2.5">
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto border-border hover:bg-background-inner gap-2 px-5 py-2.5">
            <Link href="/services">
              <LayoutGrid className="w-4 h-4" />
              Browse Services
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}