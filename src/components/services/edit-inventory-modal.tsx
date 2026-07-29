import React, { useState, useEffect } from 'react';
import { X, Loader2, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';
import { showSuccessToast, showErrorToast } from '@/components/reusables/toast-variant';

export interface InventoryItem {
  id: string | number;
  category?: string;
  name?: string;
  amount?: number | string;
  unit?: string;
  ef?: number | string;
  efSource?: string;
  dateFrom?: string;
  dateTo?: string;
  facility?: string;
  approvalStatus?: string;
  comment?: string;
  documentPath?: string;
  emission?: number | string;
  [key: string]: any;
}

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSaved: () => void;
  facilities?: { id: number | string; name: string }[];
}

export function EditInventoryModal({
  isOpen,
  onClose,
  item,
  onSaved,
  facilities = [],
}: EditInventoryModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string | number>('');
  const [unit, setUnit] = useState('');
  const [ef, setEf] = useState<string | number>('');
  const [efSource, setEfSource] = useState('');
  const [facility, setFacility] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Approved');
  const [comment, setComment] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setAmount(item.amount !== undefined && item.amount !== null ? item.amount : '');
      setUnit(item.unit || '');
      setEf(item.ef !== undefined && item.ef !== null ? item.ef : '');
      setEfSource(item.efSource || '');
      setFacility(item.facility || '');
      setDateFrom(item.dateFrom || item.from || '');
      setDateTo(item.dateTo || item.to || '');
      setApprovalStatus(item.approvalStatus || item.status || 'Approved');
      setComment(item.comment || '');
      setProofFile(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      let uploadedDocPath = item.documentPath;
      if (proofFile) {
        try {
          const formData = new FormData();
          formData.append('file', proofFile);
          const uploadRes = await apiService.post<any>(API_LIST.UPLOAD_INVENTORY_DOC, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const uploadData = (uploadRes as any)?.data ?? uploadRes;
          uploadedDocPath = uploadData?.documentPath || uploadedDocPath;
        } catch (uploadErr) {
          console.error('Failed to upload proof document:', uploadErr);
          showErrorToast('Failed to upload new proof document file.');
        }
      }

      const payload = {
        name,
        amount: parseFloat(String(amount)) || 0,
        unit,
        ef: parseFloat(String(ef)) || 0,
        efSource,
        facility,
        dateFrom,
        dateTo,
        approvalStatus,
        comment,
        documentPath: uploadedDocPath,
      };

      await apiService.put(API_LIST.INVENTORY_ENTRIES, item.id, payload);
      showSuccessToast('Inventory entry updated successfully!');
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      showErrorToast('Failed to update inventory record in database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">Edit Inventory Entry</h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Category: <span className="text-emerald-700 font-semibold">{item.category || 'Emission Entry'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entry Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Entry / Activity Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Natural Gas"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              />
            </div>

            {/* Facility */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Facility</label>
              {facilities.length > 0 ? (
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
                >
                  <option value="">Select Facility</option>
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.name}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="e.g. Central HQ"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
                />
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. sm3, kWh, kg, km"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              />
            </div>

            {/* Emission Factor */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Emission Factor (EF)</label>
              <input
                type="number"
                step="any"
                value={ef}
                onChange={(e) => setEf(e.target.value)}
                placeholder="e.g. 1.938"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              />
              <div className="mt-1 flex items-center justify-between px-1">
                <span className="text-[10px] text-neutral-500 font-medium">Live Emission Calc:</span>
                <span className="text-[11px] font-bold text-[#059669]">
                  {(() => {
                    const amtVal = parseFloat(String(amount)) || 0;
                    const efVal = parseFloat(String(ef)) || 0;
                    const uLower = (unit || '').toLowerCase();
                    if (uLower === 'tonne' || uLower === 'ton') {
                      return efVal > 1.0 ? ((amtVal * efVal) / 1000).toFixed(3) : (amtVal * efVal).toFixed(3);
                    }
                    return ((amtVal * efVal) / 1000).toFixed(3);
                  })()} t CO₂-e
                </span>
              </div>
            </div>

            {/* EF Source */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">EF Source</label>
              <input
                type="text"
                value={efSource}
                onChange={(e) => setEfSource(e.target.value)}
                placeholder="e.g. IPCC-AR6"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Date From</label>
              <input
                type="text"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="01.01.2026"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Date To</label>
              <input
                type="text"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="31.12.2026"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              />
            </div>

            {/* Approval Status */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Approval Status</label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
              >
                <option value="Approved">Approved</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Comment */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Comments / Notes</label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any notes or justification..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white resize-none"
              />
            </div>

            {/* Document Proof */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Proof Document</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors border border-neutral-200">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>{proofFile ? proofFile.name : 'Upload New Proof Document'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProofFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                {item.documentPath && !proofFile && (
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate max-w-[200px]">{item.documentPath}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#00C9A7] hover:bg-[#00B395] text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
