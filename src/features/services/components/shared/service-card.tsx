'use client';

import React from 'react';
import { ExternalLink, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Service } from '@/types/services';
import { ServiceCardProps } from '@/types/components/services.types';

/** Colour palette for tag badges — cycles deterministically by tag text */
const TAG_PALETTES: readonly { bg: string; text: string; border: string }[] = [
  { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  { bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
  { bg: '#ECFDF5', text: '#15803D', border: '#BBF7D0' },
  { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
];

function getTagPalette(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_PALETTES[Math.abs(hash) % TAG_PALETTES.length];
}


export function ServiceCard({
  service,
  isSubscribed = false,
  showControls = false,
  isAssigning = false,
  isRemoving = false,
  onAssign,
  onRemove,
}: ServiceCardProps) {
  return (
    <div
      className={`relative group bg-background rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
        isSubscribed ? 'border-primary/30 shadow-sm' : 'border-border'
      }`}
    >
      {/* Subscribed glow strip */}
      {isSubscribed && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-positive-500" />
      )}

      <div className="p-5 flex flex-col gap-3 h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Brand name */}
            <span className="text-sm font-bold text-neutral-800 tracking-tight whitespace-nowrap">
              {service.name}
            </span>

            {/* Tag badges */}
            {service.tags?.map((tag) => {
              const palette = getTagPalette(tag);
              return (
                <span
                  key={tag}
                  style={{
                    background: palette.bg,
                    color: palette.text,
                    border: `1px solid ${palette.border}`,
                  }}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap leading-none"
                >
                  {tag}
                </span>
              );
            })}
          </div>

          {/* Subscribed badge */}
          {isSubscribed && (
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-500 leading-relaxed flex-1 line-clamp-3">
          {service.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          {/* Demo link */}
          <a
            href={
              service.demoUrl && service.demoUrl !== '#'
                ? service.demoUrl
                : `/services/${service.code.toLowerCase()}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Demo
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Controls (Super Admin) */}
          {showControls && (
            <div className="flex items-center gap-1.5">
              {isSubscribed ? (
                <button
                  onClick={() => onRemove?.(service)}
                  disabled={isRemoving}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-negative-500 hover:bg-negative-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => onAssign?.(service)}
                  disabled={isAssigning}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
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
