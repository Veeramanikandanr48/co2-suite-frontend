'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Clock, User, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { MasterItem } from '@/types/master-management.types';

interface MasterItemVersionRecord {
  id: number;
  masterItemId: number;
  version: number;
  action: string;
  changeReason?: string;
  snapshot: Record<string, any>;
  diff?: { before?: Record<string, any>; after?: Record<string, any> };
  createdBy?: number;
  createdAt: string;
}

interface MasterHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MasterItem | null;
}

export function MasterHistoryModal({ isOpen, onClose, item }: MasterHistoryModalProps) {
  const [history, setHistory] = useState<MasterItemVersionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<MasterItemVersionRecord | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      fetchHistory(item.id);
    }
  }, [isOpen, item]);

  const fetchHistory = async (id: string | number) => {
    try {
      setLoading(true);
      const res: any = await apiService.get(`${API_LIST.MASTERS_ITEMS}/${id}/history`);
      const records = res?.data || res || [];
      setHistory(records);
      if (records.length > 0) {
        setSelectedVersion(records[0]);
      }
    } catch (err) {
      console.error('Failed to fetch item history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Audit History: {item.name}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Code: {item.code} | Type: {item.type}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Timeline */}
            <div className="md:col-span-2 p-4 overflow-y-auto space-y-3 bg-muted/10">
              <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                Revisions ({history.length})
              </span>
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No revision history found.</div>
              ) : (
                <div className="space-y-2">
                  {history.map((ver) => (
                    <button
                      key={ver.id}
                      onClick={() => setSelectedVersion(ver)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                        selectedVersion?.id === ver.id
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-xs'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="text-foreground">v{ver.version} ({ver.action})</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate text-[11px]">
                        {ver.changeReason || 'No reason provided'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Details / Diff Viewer */}
            <div className="md:col-span-3 p-5 overflow-y-auto space-y-4">
              {selectedVersion ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      Version {selectedVersion.version} Snapshot
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 rounded-full uppercase">
                      {selectedVersion.action}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Reason: <strong className="text-foreground">{selectedVersion.changeReason || 'N/A'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Timestamp: <strong className="text-foreground">{new Date(selectedVersion.createdAt).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Diff if present */}
                  {selectedVersion.diff && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Field Changes</span>
                      <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2 text-xs">
                        {Object.entries(selectedVersion.diff.after || {}).map(([key, val]) => {
                          const prevVal = selectedVersion.diff?.before?.[key];
                          if (prevVal === val) return null;
                          return (
                            <div key={key} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                              <span className="font-semibold text-foreground font-mono">{key}:</span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="line-through text-red-500">{String(prevVal ?? 'null')}</span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <span className="font-bold text-emerald-600">{String(val ?? 'null')}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Full JSON Snapshot */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Snapshot Data</span>
                    <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto">
                      {JSON.stringify(selectedVersion.snapshot, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">Select a version from timeline</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg transition-colors"
            >
              Close History
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
