'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MasterSidebar } from './master-sidebar';
import { MasterDashboard } from './master-dashboard';
import { MasterDataGrid } from './master-data-grid';
import { MasterDetailDrawer } from './master-detail-drawer';
import { MasterItemModal } from './master-item-modal';
import { MasterBulkImportModal } from './master-bulk-import-modal';
import { MasterCommandPalette } from './master-command-palette';
import { MasterItem, MasterItemFormData } from '@/types/master-management.types';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { toast } from '@/hooks/use-toast';
import { MasterServiceSelectorGrid } from './master-service-selector-grid';


// Keys that show the dashboard instead of a data grid
const DASHBOARD_KEY = 'DASHBOARD';
const GOVERNANCE_KEYS = new Set(['IMPORTS', 'HISTORY', 'VALIDATION']);

export function MasterManagementView() {
  const [viewMode, setViewMode] = useState<'HUB' | 'WORKSPACE'>('WORKSPACE');
  const [selectedKey, setSelectedKey] = useState<string>(DASHBOARD_KEY);
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>('CARBON');
  const [drawerItem, setDrawerItem] = useState<MasterItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [gridRefreshKey, setGridRefreshKey] = useState(0);

  // ── Ctrl+K command palette shortcut ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelectServiceFromHub = useCallback((serviceCode: string) => {
    setSelectedServiceCode(serviceCode);
    setViewMode('WORKSPACE');
  }, []);

  const handleNavSelect = useCallback((key: string) => {
    setSelectedKey(key);
    setDrawerItem(null); // close drawer on navigation
  }, []);

  const handleRowClick = useCallback((item: MasterItem) => {
    setDrawerItem(item);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerItem(null);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    setIsCreateOpen(false);
    setGridRefreshKey((k) => k + 1);
  }, []);

  const handleImportSuccess = useCallback(() => {
    setIsImportOpen(false);
    setGridRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = useCallback(async (item: MasterItem) => {
    try {
      await apiService.delete(API_LIST.MASTERS_ITEMS, item.id);
      toast({ title: 'Deleted', description: `${item.name} has been removed.` });
      setDrawerItem(null);
      setGridRefreshKey((k) => k + 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' });
    }
  }, []);

  const showDashboard = selectedKey === DASHBOARD_KEY;
  const showGrid = !showDashboard && !GOVERNANCE_KEYS.has(selectedKey);

  // Render Service Hub Landing page (accessible via sidebar button only)
  if (viewMode === 'HUB') {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-background">
        <MasterServiceSelectorGrid onSelectService={handleSelectServiceFromHub} />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Left Sidebar ─────────────────────────────────────────────── */}
      <MasterSidebar
        selectedKey={selectedKey}
        onSelect={handleNavSelect}
        selectedServiceCode={selectedServiceCode}
        onOpenHub={() => setViewMode('HUB')}
      />

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Workspace Header Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              Carbon
            </span>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <span className="text-xs font-bold text-foreground">
              Master Data Workspace
            </span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedKey}_${selectedServiceCode}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              {showDashboard ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <MasterDashboard onNavigate={handleNavSelect} serviceCode={selectedServiceCode} />
                </div>
              ) : showGrid ? (
                <MasterDataGrid
                  typeKey={selectedKey}
                  serviceCode={selectedServiceCode}
                  refreshKey={gridRefreshKey}
                  selectedItem={drawerItem}
                  onRowClick={handleRowClick}
                  onCreateClick={() => setIsCreateOpen(true)}
                  onImportClick={() => setIsImportOpen(true)}
                  onPaletteClick={() => setIsPaletteOpen(true)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  {selectedKey} — coming soon
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Right Detail Drawer ──────────────────────────────────────── */}
          <MasterDetailDrawer
            item={drawerItem}
            onClose={handleDrawerClose}
            onDelete={handleDelete}
            onSaveSuccess={() => setGridRefreshKey((k) => k + 1)}
          />
        </div>
      </div>

      {/* ── Modals & Overlays ─────────────────────────────────────────── */}
      {isCreateOpen && (
        <MasterItemModal
          isOpen={isCreateOpen}
          editingItem={null}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleSaveSuccess}
          defaultType={selectedKey !== DASHBOARD_KEY ? selectedKey : undefined}
          defaultServiceCode={selectedServiceCode}
        />
      )}

      {isImportOpen && (
        <MasterBulkImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      <MasterCommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={handleNavSelect}
      />
    </div>
  );
}
