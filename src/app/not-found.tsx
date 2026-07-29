import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CloudOff, LayoutDashboard, LayoutGrid } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-white text-neutral-900 relative overflow-hidden">
      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* Solid Monochrome Visual Badge */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-neutral-900 text-white border border-neutral-800 flex items-center justify-center shadow-xl">
          <CloudOff className="w-12 h-12" />
        </div>

        {/* 404 Header & Message */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-900 bg-neutral-100 rounded-full border border-neutral-300">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Page Not Found
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            The page you are looking for does not exist or has been moved to another location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="w-full sm:w-auto bg-[#0B132B] hover:bg-black text-white font-bold gap-2 px-5 py-2.5 rounded-xl cursor-pointer">
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-bold gap-2 px-5 py-2.5 rounded-xl cursor-pointer">
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