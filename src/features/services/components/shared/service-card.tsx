'use client';

import React from 'react';
import { ExternalLink, CheckCircle2, Plus, Trash2, Cpu, BarChart3, Leaf, Factory, Globe, Shield } from 'lucide-react';
import { ServiceCardProps } from '@/types/components/services.types';

const SERVICE_ICONS: Record<string, React.ElementType> = {
  carbon: BarChart3,
  cbam: Shield,
  pef_textiles: Leaf,
  lca_plastics: Factory,
  lca_metals: Factory,
  esg: Globe,
  epd_cables: Cpu,
};

const CATEGORY_COLORS: Record<string, string> = {
  Carbon: 'from-emerald-500 to-emerald-600',
  CBAM: 'from-blue-500 to-indigo-600',
  'Textiles & Apparels': 'from-amber-500 to-orange-600',
  Plastics: 'from-cyan-500 to-teal-600',
  Metals: 'from-sky-500 to-blue-600',
  ESG: 'from-violet-500 to-purple-600',
  Cables: 'from-rose-500 to-pink-600',
};

export function ServiceCard({
  service,
  isSubscribed = false,
  showControls = false,
  isAssigning = false,
  isRemoving = false,
  onAssign,
  onRemove,
}: ServiceCardProps) {
  const Icon = SERVICE_ICONS[service.code.toLowerCase()] || BarChart3;
  const primaryTag = service.tags?.[0] || 'Service';
  const gradient = CATEGORY_COLORS[primaryTag] || 'from-primary to-primary/80';

  return (
    <div
      className={`relative group bg-card rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${
        isSubscribed ? 'border-primary/30 shadow-xs' : 'border-border'
      }`}
    >
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient} ${
        isSubscribed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      } transition-opacity`} />

      <div className="p-5 flex flex-col gap-4 h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xs shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="min-w-0">
              <span className="text-sm font-bold text-foreground tracking-tight block truncate">
                {service.name}
              </span>
              {/* Tag badges */}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {service.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold leading-none bg-muted text-muted-foreground border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Subscribed indicator */}
          {isSubscribed && (
            <div className="shrink-0 bg-primary/10 text-primary rounded-full p-1.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2">
          {service.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {/* Demo link */}
          <a
            href={
              service.demoUrl && service.demoUrl !== '#'
                ? service.demoUrl
                : `/services/${service.code.toLowerCase()}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors"
          >
            Open Module
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Controls (Super Admin) */}
          {showControls && (
            <div className="flex items-center gap-1.5">
              {isSubscribed ? (
                <button
                  onClick={() => onRemove?.(service)}
                  disabled={isRemoving}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => onAssign?.(service)}
                  disabled={isAssigning}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground hover:bg-accent px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 border border-border cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Assign
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
