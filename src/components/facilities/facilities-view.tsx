'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Building,
  LayoutGrid,
  Table as TableIcon,
  Map as MapIcon,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/api-service';
import { useAuth } from '@/context/auth-provider';
import { FacilityModal, FacilityData } from './facility-modal';
import { CompanyView } from '@/features/manage-account/components/company-view';
import { UsersView } from '@/features/manage-account/components/users-view';

export function FacilitiesView() {
  const { user } = useAuth();
  const canEdit = !user || user.roleId === 1 || user.roleId === 2;
  const [activeTab, setActiveTab] = useState<'company' | 'facilities' | 'users'>('facilities');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'map'>('cards');
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityData | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await apiService.get<FacilityData[]>('facilities');
      const data = (res as any)?.data ?? res;
      setFacilities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedFacility(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (facility: FacilityData) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleDeleteFacility = async (id: number | string) => {
    try {
      await apiService.delete('facilities', id);
      toast.success('Facility deleted');
      fetchFacilities();
    } catch (err) {
      toast.error('Failed to delete facility');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Manage Account Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'company'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'company' ? '#0B132B' : undefined }}
        >
          <Building2 className="w-3.5 h-3.5" /> My Company
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'facilities'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'facilities' ? '#0B132B' : undefined }}
        >
          <Building className="w-3.5 h-3.5" /> Facilities
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'users'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'users' ? '#0B132B' : undefined }}
        >
          <Users className="w-3.5 h-3.5" /> Users
        </button>
      </div>

      {activeTab === 'company' ? (
        <CompanyView />
      ) : activeTab === 'users' ? (
        <UsersView />
      ) : (
        <>
          {/* Title Header */}
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Facilities Management</h1>
            <p className="text-xs text-neutral-500 mt-1">Manage and monitor all your facilities in one place</p>
          </div>

      {/* Action Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-4">
        <div className="text-xs font-bold text-neutral-700">
          Total Facilities: <span className="text-emerald-600">{facilities.length}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                viewMode === 'map' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
          </div>

          {/* Add Facility Button */}
          {canEdit && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Facility
            </button>
          )}
        </div>
      </div>

      {/* View Content */}
      {loading ? (
        <div className="py-16 text-center text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading facilities...
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.length === 0 ? (
            <div className="col-span-full bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-400 font-medium">
              No facilities found.
            </div>
          ) : (
            facilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Top Accent Line */}
                <div className="h-1 bg-blue-600 w-full" />

                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-bold text-neutral-900">{fac.name}</h3>

                  {/* Map / Location container matching screenshot */}
                  <div className="h-32 bg-neutral-100 rounded-lg border border-neutral-200 flex flex-col items-center justify-center gap-1 text-neutral-400">
                    <MapPin className="w-6 h-6 text-neutral-400" />
                    <span className="text-xs text-neutral-500 font-medium">
                      {fac.address || 'No location'}
                    </span>
                  </div>
                </div>

                {/* Footer bar matching screenshot */}
                <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-400">
                    {fac.createdOn ? new Date(fac.createdOn).toLocaleDateString() : '-'}
                  </span>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(fac)}
                        className="p-2 bg-neutral-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
                        title="Edit Facility"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {fac.id && (
                        <button
                          onClick={() => handleDeleteFacility(fac.id!)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200"
                          title="Delete Facility"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100 text-[11px] font-bold text-neutral-600 border-b border-neutral-200">
                <th className="py-3 px-4">Actions</th>
                <th className="py-3 px-4">Facility Name</th>
                <th className="py-3 px-4">Installation Address</th>
                <th className="py-3 px-4">UN/LOCODE</th>
                <th className="py-3 px-4">Post Code</th>
                <th className="py-3 px-4">Country Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {facilities.map((fac) => (
                <tr key={fac.id} className="hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Edit2
                        className="w-4 h-4 text-neutral-500 hover:text-emerald-600 cursor-pointer"
                        onClick={() => handleOpenEditModal(fac)}
                      />
                      <Trash2
                        className="w-4 h-4 text-neutral-500 hover:text-red-600 cursor-pointer"
                        onClick={() => fac.id && handleDeleteFacility(fac.id)}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-800">{fac.name}</td>
                  <td className="py-3 px-4 text-neutral-600">{fac.address || '-'}</td>
                  <td className="py-3 px-4 text-neutral-600">{fac.unLocode || '-'}</td>
                  <td className="py-3 px-4 text-neutral-600">{fac.postCode || '-'}</td>
                  <td className="py-3 px-4 text-neutral-600">{fac.countryCode || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Map View */
        <div className="bg-white border border-neutral-200 rounded-xl p-6 h-96 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <MapPin className="w-12 h-12 text-emerald-600 animate-pulse" />
          <h3 className="text-sm font-bold text-neutral-800">Map View Mode</h3>
          <p className="text-xs text-neutral-500">
            Displaying interactive Leaflet markers for {facilities.length} registered facilities across global locations.
          </p>
        </div>
      )}

      {/* Facility Edit / Add Modal */}
      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFacilities}
        facility={selectedFacility}
      />
        </>
      )}
    </div>
  );
}
