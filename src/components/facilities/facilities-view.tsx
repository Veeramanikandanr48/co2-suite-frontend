'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/api-service';
import { useAuth } from '@/context/auth-provider';
import { PageHeader } from '@/components/shared';
import { FacilityModal, FacilityData } from './facility-modal';
import { CompanyView } from '@/features/manage-account/components/company-view';
import { UsersView } from '@/features/manage-account/components/users-view';

const tabOptions = [
  { key: 'company', label: 'My Company', icon: Building2 },
  { key: 'facilities', label: 'Facilities', icon: Building },
  { key: 'users', label: 'Users', icon: Users },
] as const;

const viewOptions = [
  { key: 'cards', label: 'Cards', icon: LayoutGrid },
  { key: 'table', label: 'Table', icon: TableIcon },
  { key: 'map', label: 'Map', icon: MapIcon },
] as const;

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
    } catch {
      toast.error('Failed to delete facility');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="page-container"
    >
      <PageHeader
        icon={Building2}
        title="Manage Account"
        description="Manage your company profile, facilities, and team members."
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
        {tabOptions.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
                isActive
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-card text-muted-foreground border border-border hover:bg-accent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'company' ? (
        <CompanyView />
      ) : activeTab === 'users' ? (
        <UsersView />
      ) : (
        <>
          {/* Action Bar */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center justify-between gap-4 mb-4">
            <div className="text-xs font-bold text-muted-foreground">
              Total Facilities:{' '}
              <span className="text-foreground font-extrabold">{facilities.length}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggles */}
              <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
                {viewOptions.map((opt) => {
                  const OptIcon = opt.icon;
                  const isViewActive = viewMode === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setViewMode(opt.key as typeof viewMode)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                        isViewActive
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <OptIcon className="w-3.5 h-3.5" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {canEdit && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Facility
                </button>
              )}
            </div>
          </div>

          {/* View Content */}
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading facilities...
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.length === 0 ? (
                <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground font-medium">
                  No facilities found.
                </div>
              ) : (
                facilities.map((fac, i) => (
                  <motion.div
                    key={fac.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="h-1 bg-primary w-full" />
                    <div className="p-4 space-y-3">
                      <h3 className="text-sm font-bold text-foreground">{fac.name}</h3>
                      <div className="h-32 bg-muted rounded-lg border border-border flex flex-col items-center justify-center gap-1 text-muted-foreground">
                        <MapPin className="w-6 h-6 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {fac.address || 'No location'}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-muted/50 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {fac.createdOn ? new Date(fac.createdOn).toLocaleDateString() : '-'}
                      </span>
                      {canEdit && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(fac)}
                            className="p-2 bg-foreground hover:bg-foreground/90 text-background rounded-lg transition-colors shadow-xs"
                            title="Edit Facility"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {fac.id && (
                            <button
                              onClick={() => handleDeleteFacility(fac.id!)}
                              className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors border border-destructive/20"
                              title="Delete Facility"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/70 text-[11px] font-bold text-muted-foreground border-b border-border">
                    <th className="py-3 px-4">Actions</th>
                    <th className="py-3 px-4">Facility Name</th>
                    <th className="py-3 px-4">Installation Address</th>
                    <th className="py-3 px-4">UN/LOCODE</th>
                    <th className="py-3 px-4">Post Code</th>
                    <th className="py-3 px-4">Country Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {facilities.map((fac) => (
                    <tr key={fac.id} className="hover:bg-accent/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Edit2
                            className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer"
                            onClick={() => handleOpenEditModal(fac)}
                          />
                          <Trash2
                            className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={() => fac.id && handleDeleteFacility(fac.id)}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">{fac.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{fac.address || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{fac.unLocode || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{fac.postCode || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{fac.countryCode || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 h-96 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <MapPin className="w-12 h-12 text-primary animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">Map View Mode</h3>
              <p className="text-xs text-muted-foreground">
                Displaying interactive markers for {facilities.length} registered facilities.
              </p>
            </div>
          )}

          <FacilityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchFacilities}
            facility={selectedFacility}
          />
        </>
      )}
    </motion.div>
  );
}
