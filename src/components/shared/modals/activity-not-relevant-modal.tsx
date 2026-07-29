'use client';

import React, { useState } from 'react';
import { ActivityNotRelevantModalProps } from '@/types/components/reusables.types';

const LOCAL_STORAGE_KEY = 'co2_activity_not_relevant_skip_modal';

/**
 * Branded modal that appears when the user ticks "Activity is not relevant".
 *
 * - Shows a "Do not show this again" checkbox.
 * - When confirmed with that checkbox ticked, future opens are skipped via
 *   localStorage – the parent still receives `onConfirm` immediately.
 */
export function ActivityNotRelevantModal({
  open,
  onConfirm,
  onCancel,
}: ActivityNotRelevantModalProps) {
  const [doNotShow, setDoNotShow] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    if (doNotShow) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      } catch {
        // ignore storage errors in SSR / private-mode browsers
      }
    }
    onConfirm();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      {/* Card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand header */}
        <div className="flex items-center justify-center pt-6 pb-4">
          <span className="text-lg font-black tracking-tight">
            <span className="text-neutral-800">cage</span>
            <span className="text-[#00C9A7]">CARBON</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E6E8EB] mx-6" />

        {/* Body */}
        <div className="px-7 pt-5 pb-4 text-center space-y-4">
          <p className="text-sm text-neutral-600 leading-relaxed">
            The calculations for this activity will not be taken into account.
          </p>

          {/* Do not show again */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={doNotShow}
              onChange={(e) => setDoNotShow(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-neutral-300 text-[#00C9A7] focus:ring-[#00C9A7] cursor-pointer"
            />
            <span className="text-xs text-neutral-500 font-medium">
              Do not show this again
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 flex justify-center">
          <button
            onClick={handleConfirm}
            className="bg-[#00C9A7] hover:bg-[#00b396] text-white text-sm font-bold px-10 py-2 rounded-xl shadow-sm transition-colors duration-150"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Returns `true` when the user has previously ticked "Do not show again",
 * so the parent can skip opening the modal and directly mark the activity
 * as not relevant.
 */
export function shouldSkipActivityNotRelevantModal(): boolean {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
