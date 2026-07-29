'use client';

import React, { useState, useEffect } from 'react';
import { X, Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/api-service';

import { CompanyModalData } from '@/types/manage-account';

export type { CompanyModalData };

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyData?: CompanyModalData | null;
}

export function CompanyModal({ isOpen, onClose, onSuccess, companyData }: CompanyModalProps) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [allowedDomains, setAllowedDomains] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (companyData) {
      setName(companyData.name || '');
      setCountry(companyData.country || '');
      setContactEmail(companyData.contactEmail || '');
      setPhone(companyData.contactPhone || '');
      setAddress(companyData.address || '');
      setTaxId(companyData.taxId === 'Not set' ? '' : companyData.taxId || '');
      setAllowedDomains(companyData.allowedDomains || '');
    }
  }, [companyData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactEmail.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        country,
        contactEmail,
        phone,
        address,
        taxId,
        emailDomain: allowedDomains,
      };

      const orgId = companyData?.id || 1;
      await apiService.put('organizations', orgId, payload);
      toast.success('Company details updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update company details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 text-neutral-700 rounded-xl border border-neutral-200">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Edit Company Details</h2>
              <p className="text-xs text-neutral-400">Update branding, location, and contact details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. WD Solutions Co. LLC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="admin@w-d.ae"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+90"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Registration Country</label>
              <input
                type="text"
                placeholder="e.g. Türkiye"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Tax ID</label>
              <input
                type="text"
                placeholder="Tax identification number"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Contact Address</label>
            <input
              type="text"
              placeholder="e.g. Agha Yasin"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Allowed Email Domains</label>
            <input
              type="text"
              placeholder="e.g. w-d.ae"
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-neutral-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#0B132B' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
