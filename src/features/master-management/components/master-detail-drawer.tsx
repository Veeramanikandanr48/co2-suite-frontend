'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, MoreVertical, Clock, Tag, Info, History, Link2, ShieldCheck } from 'lucide-react';
import { MasterItem, MasterItemFormData } from '@/types/master-management.types';
import { StatusBadge } from '@/components/ui/status-badge';
import { TypeBadge } from '@/components/ui/type-badge';
import { Timeline, TimelineEvent } from '@/components/ui/page-layout';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type DrawerTab = 'overview' | 'metadata' | 'history' | 'dependencies' | 'audit';

const TABS: { key: DrawerTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',      label: 'Overview',      icon: Info },
  { key: 'metadata',      label: 'Metadata',       icon: Tag },
  { key: 'history',       label: 'History',        icon: History },
  { key: 'dependencies',  label: 'Dependencies',   icon: Link2 },
  { key: 'audit',         label: 'Audit',          icon: ShieldCheck },
];

interface MasterDetailDrawerProps {
  item: MasterItem | null;
  onClose: () => void;
  onDelete: (item: MasterItem) => Promise<void>;
  onSaveSuccess: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex-1 text-sm text-foreground min-w-0">{value || '—'}</div>
    </div>
  );
}

export function MasterDetailDrawer({ item, onClose, onDelete, onSaveSuccess }: MasterDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MasterItemFormData>>({});

  const handleOpenEdit = useCallback(() => {
    if (!item) return;
    setEditForm({
      type: item.type,
      code: item.code,
      name: item.name,
      description: item.description ?? '',
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive !== false,
    });
    setIsEditing(true);
  }, [item]);

  const handleSave = useCallback(async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await apiService.put(API_LIST.MASTERS_ITEMS, item.id, editForm);
      toast({ title: 'Saved', description: `${editForm.name} updated successfully.` });
      setIsEditing(false);
      onSaveSuccess();
    } catch {
      toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [item, editForm, onSaveSuccess]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    setIsDeleting(true);
    try {
      await onDelete(item);
    } finally {
      setIsDeleting(false);
    }
  }, [item, onDelete]);

  const historyEvents: TimelineEvent[] = item ? [
    {
      id: 'created',
      title: 'Created',
      description: `by ${item.customAttributes?.createdBy ?? 'system'}`,
      timestamp: item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy HH:mm') : '—',
    },
    ...(item.updatedAt && item.updatedAt !== item.createdAt ? [{
      id: 'updated',
      title: 'Last updated',
      description: `by ${item.customAttributes?.updatedBy ?? 'system'}`,
      timestamp: format(new Date(item.updatedAt), 'MMM d, yyyy HH:mm'),
    }] : []),
  ] : [];

  return (
    <AnimatePresence>
      {item && (
        <motion.aside
          key="drawer"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-[380px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden shadow-[var(--shadow-xl)] md:relative fixed right-0 top-0 bottom-0 z-40"
        >
          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <TypeBadge type={item.type} />
                  <StatusBadge status={item.isActive !== false ? 'PUBLISHED' : 'ARCHIVED'} />
                </div>
                <h2 className="text-base font-bold text-foreground leading-tight truncate">
                  {item.name}
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{item.code}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-7 px-3 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="h-7 px-3 text-xs font-medium rounded-lg border border-input hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleOpenEdit}
                    className="h-7 px-3 text-xs font-medium rounded-lg border border-input hover:bg-muted transition-colors inline-flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-7 px-3 text-xs font-medium rounded-lg border border-negative-200 text-negative-600 hover:bg-negative-50 dark:hover:bg-negative-900/20 transition-colors inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Trash2 className="w-3 h-3" />
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────── */}
          <div className="flex border-b border-border shrink-0 overflow-x-auto scrollbar-hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setIsEditing(false); }}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0',
                    'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-t after:transition-transform',
                    activeTab === tab.key
                      ? 'text-foreground after:bg-primary after:scale-x-100'
                      : 'text-muted-foreground hover:text-foreground after:bg-primary after:scale-x-0'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {activeTab === 'overview' && (
                  <div className="px-4 pt-2 pb-4">
                    {isEditing ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Name *</label>
                          <input
                            value={editForm.name ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full h-8 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Code *</label>
                          <input
                            value={editForm.code ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
                            className="w-full h-8 px-3 text-sm font-mono bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
                          <textarea
                            value={editForm.description ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sort Order</label>
                          <input
                            type="number"
                            value={editForm.sortOrder ?? 0}
                            onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                            className="w-full h-8 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={editForm.isActive !== false}
                            onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                            className="rounded"
                          />
                          <label htmlFor="isActive" className="text-sm font-medium text-foreground">Active</label>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        <DetailRow label="Code" value={
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{item.code}</span>
                        } />
                        <DetailRow label="Type" value={<TypeBadge type={item.type} />} />
                        <DetailRow label="Status" value={
                          <StatusBadge status={item.isActive !== false ? 'PUBLISHED' : 'ARCHIVED'} />
                        } />
                        <DetailRow label="Description" value={
                          <span className="text-sm text-muted-foreground">{item.description}</span>
                        } />
                        <DetailRow label="Sort order" value={item.sortOrder} />
                        {item.scope && <DetailRow label="Scope" value={item.scope} />}
                        {item.subType && <DetailRow label="Sub-type" value={item.subType} />}
                        {item.parentId && <DetailRow label="Parent ID" value={item.parentId} />}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <div className="px-4 pt-2 pb-4 divide-y divide-border">
                    <DetailRow label="Created" value={item.createdAt ? format(new Date(item.createdAt), 'PPP') : '—'} />
                    <DetailRow label="Updated" value={item.updatedAt ? format(new Date(item.updatedAt), 'PPP') : '—'} />
                    {item.customAttributes && Object.entries(item.customAttributes).map(([k, v]) => (
                      <DetailRow key={k} label={k} value={String(v)} />
                    ))}
                    {!item.customAttributes && (
                      <p className="py-6 text-center text-sm text-muted-foreground">No extended metadata</p>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="px-4 pt-4 pb-4">
                    {historyEvents.length > 0 ? (
                      <Timeline events={historyEvents} />
                    ) : (
                      <p className="py-6 text-center text-sm text-muted-foreground">No revision history</p>
                    )}
                  </div>
                )}

                {activeTab === 'dependencies' && (
                  <div className="px-4 pt-4 pb-4">
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Dependency graph coming in ADR-013.
                    </p>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="px-4 pt-2 pb-4 divide-y divide-border">
                    <DetailRow label="ID" value={
                      <span className="font-mono text-xs">{item.id}</span>
                    } />
                    <DetailRow label="Created at" value={
                      item.createdAt ? format(new Date(item.createdAt), 'PPpp') : '—'
                    } />
                    <DetailRow label="Updated at" value={
                      item.updatedAt ? format(new Date(item.updatedAt), 'PPpp') : '—'
                    } />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
