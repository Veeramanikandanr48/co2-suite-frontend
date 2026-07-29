import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { showSuccessToast, showErrorToast } from '@/components/shared/toast-variant';
import { InventoryItem, EditModalItem } from '@/types/inventory';
import { EditInventoryFormFields } from './edit-inventory-form-fields';

export type { InventoryItem, EditModalItem };
import { EditInventoryModalProps } from '@/types/components/services.types';


export function EditInventoryModal({
  open,
  isOpen,
  onClose,
  item,
  onSaved,
  dbFacilities = [],
}: EditInventoryModalProps) {
  const isVisible = open !== undefined ? open : (isOpen ?? false);

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [facility, setFacility] = useState('');
  const [amount, setAmount] = useState<string | number>('');
  const [unit, setUnit] = useState('');
  const [ef, setEf] = useState<string | number>('');
  const [efSource, setEfSource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Approved');
  const [comment, setComment] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setFacility(item.facility || '');
      setAmount(item.amount ?? '');
      setUnit(item.unit || '');
      setEf(item.ef ?? '');
      setEfSource(item.efSource || '');
      setDateFrom(item.dateFrom || '');
      setDateTo(item.dateTo || '');
      setApprovalStatus(item.approvalStatus || 'Approved');
      setComment(item.comment || '');
      setProofFile(null);
    }
  }, [item]);

  if (!isVisible || !item) return null;

  const handleSave = async (e: React.FormEvent) => {
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
        } catch {
          showErrorToast('Failed to upload proof document file.');
        }
      }

      const payload = {
        name,
        facility,
        amount: Number(amount) || 0,
        unit,
        ef: Number(ef) || 0,
        efSource,
        dateFrom,
        dateTo,
        approvalStatus,
        comment,
        documentPath: uploadedDocPath,
      };

      await apiService.put(API_LIST.INVENTORY_ENTRIES, item.id, payload);
      showSuccessToast('Inventory item updated successfully!');
      onSaved();
      onClose();
    } catch {
      showErrorToast('Failed to update inventory item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E6E8EB] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#ECFDF5] text-[#059669] rounded-lg border border-[#A7F3D0]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
                Edit Inventory Entry #{item.id}
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">
                Category: {item.category || 'Scope Data'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <EditInventoryFormFields
            item={item}
            name={name}
            setName={setName}
            facility={facility}
            setFacility={setFacility}
            facilities={dbFacilities}
            amount={amount}
            setAmount={setAmount}
            unit={unit}
            setUnit={setUnit}
            ef={ef}
            setEf={setEf}
            efSource={efSource}
            setEfSource={setEfSource}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            approvalStatus={approvalStatus}
            setApprovalStatus={setApprovalStatus}
            comment={comment}
            setComment={setComment}
            proofFile={proofFile}
            setProofFile={setProofFile}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0F2F5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
