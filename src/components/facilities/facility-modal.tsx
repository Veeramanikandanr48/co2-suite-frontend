'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api-service';

import { FacilityData } from '@/types/facilities';

export type { FacilityData };

interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  facility?: FacilityData | null;
}

export function FacilityModal({ isOpen, onClose, onSuccess, facility }: FacilityModalProps) {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [unLocode, setUnLocode] = useState('');
  const [postCode, setPostCode] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [mapSearch, setMapSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (facility) {
      setName(facility.name || '');
      setLatitude(facility.latitude ? String(facility.latitude) : '');
      setLongitude(facility.longitude ? String(facility.longitude) : '');
      setAddress(facility.address || '');
      setUnLocode(facility.unLocode || '');
      setPostCode(facility.postCode || '');
      setCountryCode(facility.countryCode || '');
    } else {
      setName('');
      setLatitude('');
      setLongitude('');
      setAddress('');
      setUnLocode('');
      setPostCode('');
      setCountryCode('');
    }
  }, [facility, isOpen]);

  if (!isOpen) return null;

  const handleLatLongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`Coordinates set: Lat ${latitude}, Lon ${longitude}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a facility name');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        address,
        unLocode,
        postCode,
        countryCode,
      };

      if (facility?.id) {
        await apiService.put('facilities', facility.id, payload);
      } else {
        await apiService.post('facilities', payload);
      }

      toast.success(facility?.id ? 'Facility updated successfully' : 'Facility added successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving facility');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 text-neutral-600 rounded-xl border border-neutral-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {facility?.id ? 'Edit Facility' : 'Add Facility'}
              </h2>
              <p className="text-xs text-neutral-500">Update the facility details and location.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Facility Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="WD Solutions Co. LLC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-700">Location</label>

            {/* Interactive Map Placeholder */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 relative">
              <div className="p-3 bg-white border-b border-neutral-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search for a location"
                    value={mapSearch}
                    onChange={(e) => setMapSearch(e.target.value)}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-1.5 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Map Preview Graphic */}
              <div className="h-44 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 flex items-center justify-center relative">
                <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                  <MapPin className="w-8 h-8 text-indigo-600 animate-bounce" />
                  <span className="text-xs font-semibold text-neutral-600">
                    {mapSearch || address || 'World Map View (Leaflet / OpenStreetMap)'}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-neutral-400 bg-white/80 px-2 py-0.5 rounded shadow-xs">
                  © OpenStreetMap / Leaflet
                </div>
              </div>
            </div>

            {/* Latitude and Longitude Entry */}
            <div>
              <span className="block text-xs font-bold text-neutral-700 mb-2">
                Or enter the latitude and longitude information
              </span>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-neutral-500 mb-1">Latitude</label>
                  <input
                    type="text"
                    placeholder="Enter your installation lat"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-neutral-500 mb-1">Longitude</label>
                  <input
                    type="text"
                    placeholder="Enter your installation lon"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLatLongSubmit}
                  className="self-end px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-bold text-neutral-700">Address Details</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Installation Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full installation address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">UN/LOCODE</label>
                <input
                  type="text"
                  placeholder="Search UN/LOCODE (optional)"
                  value={unLocode}
                  onChange={(e) => setUnLocode(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Post Code</label>
                <input
                  type="text"
                  placeholder="Enter post code"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Country Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled from map"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#0B132B' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
