'use client';

import React from 'react';
import { Plane, Car, DollarSign, Train, Building } from 'lucide-react';
import { Scope3TravelSubTabsProps } from '@/types/components/services.types';

export function Scope3TravelSubTabs({ activeSubTab, setActiveSubTab }: Scope3TravelSubTabsProps) {
  return (
    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-neutral-200 shadow-xs w-fit">
      <button
        onClick={() => setActiveSubTab('Flight')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${activeSubTab === 'Flight' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Plane className="w-3.5 h-3.5 text-purple-600" /> Flight
      </button>
      <button
        onClick={() => setActiveSubTab('Taxi')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${activeSubTab === 'Taxi' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Car className="w-3.5 h-3.5 text-purple-600" /> Taxi
      </button>
      <button
        onClick={() => setActiveSubTab('Sea')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${activeSubTab === 'Sea' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Sea
      </button>
      <button
        onClick={() => setActiveSubTab('Land')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${activeSubTab === 'Land' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Train className="w-3.5 h-3.5 text-purple-600" /> Land
      </button>
      <button
        onClick={() => setActiveSubTab('Hotel')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${activeSubTab === 'Hotel' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Building className="w-3.5 h-3.5 text-purple-600" /> Hotel
      </button>
    </div>
  );
}
