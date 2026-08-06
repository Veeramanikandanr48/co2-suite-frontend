'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Plus, RefreshCw, Calculator, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { toast } from '@/hooks/use-toast';

interface UnitConversionRecord {
  id: number;
  fromUnitCode: string;
  toUnitCode: string;
  multiplier: number;
  offset: number;
  dimension: string;
  description?: string;
  isActive: boolean;
}

export function UnitConversionManager() {
  const [conversions, setConversions] = useState<UnitConversionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [dimension, setDimension] = useState('MASS');
  const [description, setDescription] = useState('');

  // Interactive Test State
  const [testAmount, setTestAmount] = useState<number>(100);
  const [testFrom, setTestFrom] = useState<string>('kg');
  const [testTo, setTestTo] = useState<string>('tonne');
  const [testResult, setTestResult] = useState<number | null>(null);

  useEffect(() => {
    fetchConversions();
  }, []);

  const fetchConversions = async () => {
    try {
      setLoading(true);
      const res: any = await apiService.get(API_LIST.MASTERS_UNIT_CONVERSIONS);
      const items = res?.data || res || [];
      setConversions(items);
    } catch (err) {
      console.error('Failed to fetch unit conversions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUnit || !toUnit || !multiplier) {
      toast({
        title: 'Validation Error',
        description: 'From Unit, To Unit, and Multiplier are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiService.post(API_LIST.MASTERS_UNIT_CONVERSIONS, {
        fromUnitCode: fromUnit,
        toUnitCode: toUnit,
        multiplier,
        dimension,
        description,
      });

      toast({
        title: 'Success',
        description: 'Unit conversion rule added successfully!',
      });
      setIsModalOpen(false);
      fetchConversions();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to save conversion rule',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.delete(`${API_LIST.MASTERS_UNIT_CONVERSIONS}/${id}`);
      toast({
        title: 'Success',
        description: 'Conversion rule deactivated.',
      });
      fetchConversions();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate conversion rule.',
        variant: 'destructive',
      });
    }
  };

  const handleRunTest = async () => {
    try {
      const res: any = await apiService.get(
        `${API_LIST.MASTERS_UNIT_CONVERT}?amount=${testAmount}&fromUnitCode=${testFrom}&toUnitCode=${testTo}`
      );
      const data = res?.data || res;
      setTestResult(data?.convertedAmount ?? null);
    } catch (err: any) {
      toast({
        title: 'Conversion Test Failed',
        description: err?.response?.data?.message || 'No valid conversion path found',
        variant: 'destructive',
      });
      setTestResult(null);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Interactive Tester Widget */}
      <div className="p-5 bg-card border border-border rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            Interactive Dimensional Conversion Solver
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/10 text-blue-600 rounded-full">
            REAL-TIME SOLVER
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
            placeholder="Amount"
            className="w-full sm:w-32 px-3 py-2 bg-background border border-input rounded-lg text-xs font-semibold text-foreground focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="text"
            value={testFrom}
            onChange={(e) => setTestFrom(e.target.value)}
            placeholder="From (e.g. kg)"
            className="w-full sm:w-32 px-3 py-2 bg-background border border-input rounded-lg text-xs font-semibold text-foreground focus:ring-2 focus:ring-emerald-500"
          />

          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

          <input
            type="text"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="To (e.g. tonne)"
            className="w-full sm:w-32 px-3 py-2 bg-background border border-input rounded-lg text-xs font-semibold text-foreground focus:ring-2 focus:ring-emerald-500"
          />

          <button
            onClick={handleRunTest}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 shadow-xs"
          >
            Calculate
          </button>

          {testResult !== null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Result: {testResult.toLocaleString(undefined, { maximumFractionDigits: 6 })} {testTo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conversion Table & Actions */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-foreground">Unit Conversion Matrix ({conversions.length})</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchConversions}
              className="p-2 border border-input rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Conversion Rule
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <th className="p-3">From Unit</th>
                <th className="p-3">To Unit</th>
                <th className="p-3">Multiplier</th>
                <th className="p-3">Dimension</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading conversion rules...
                  </td>
                </tr>
              ) : conversions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No unit conversion rules defined.
                  </td>
                </tr>
              ) : (
                conversions.map((rule) => (
                  <tr key={rule.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">{rule.fromUnitCode}</td>
                    <td className="p-3 font-mono font-bold text-foreground">{rule.toUnitCode}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{rule.multiplier}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-600 rounded-full">
                        {rule.dimension}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{rule.description || '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-foreground">Add Unit Conversion Rule</h3>
            <form onSubmit={handleAddConversion} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">From Unit Code</label>
                <input
                  type="text"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  placeholder="e.g. kg"
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">To Unit Code</label>
                <input
                  type="text"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  placeholder="e.g. tonne"
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Multiplier (toUnit = fromUnit * multiplier)</label>
                <input
                  type="number"
                  step="any"
                  value={multiplier}
                  onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1)}
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Physical Dimension</label>
                <select
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs font-medium"
                >
                  <option value="MASS">MASS</option>
                  <option value="VOLUME">VOLUME</option>
                  <option value="ENERGY">ENERGY</option>
                  <option value="DISTANCE">DISTANCE</option>
                  <option value="AREA">AREA</option>
                  <option value="TIME">TIME</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description..."
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-muted text-foreground text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
