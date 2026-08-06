'use client';

import React, { useState } from 'react';
import { apiService } from '@/lib/api/api-service';
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  AlertTriangle,
  CopyCheck,
  Zap,
} from 'lucide-react';

export default function AiPlatformPage() {
  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Carbon Assistant. Ask me anything about your Scope 1, 2, or 3 emissions, calculation formulas, or reduction strategies.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // AI Assistant Tester
  const [descInput, setDescInput] = useState('');
  const [descLoading, setDescLoading] = useState(false);
  const [descResult, setDescResult] = useState<any>(null);

  // Anomalies & Duplicates
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [detectionLoading, setDetectionLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await apiService.aiChat<{ response: string }>(userMsg);
      if (res?.data?.response) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.response }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'AI Assistant temporarily unavailable. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleTestCategory = async () => {
    if (!descInput.trim()) return;
    setDescLoading(true);
    setDescResult(null);
    try {
      const res = await apiService.getAiCategorySuggestion<any>(descInput);
      if (res?.data) setDescResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDescLoading(false);
    }
  };

  const handleRunDetections = async () => {
    setDetectionLoading(true);
    try {
      const [anomRes, dupRes] = await Promise.all([
        apiService.get<any[]>('ai/anomalies?organizationId=1'),
        apiService.get<any[]>('ai/duplicates?organizationId=1'),
      ]);

      if (anomRes?.data) setAnomalies(anomRes.data);
      if (dupRes?.data) setDuplicates(dupRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetectionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span>AI ESG Intelligence Platform</span>
        </h1>
        <p className="text-xs text-neutral-500">
          Powered by 8 specialized AI capabilities: Categorization, Unit Detection, Chat Q&A, Anomaly & Duplicate Detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chat Q&A Assistant */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-3">
            <Bot className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-sm font-bold text-neutral-900">AI Carbon Conversational Assistant</h2>
              <p className="text-[10px] text-neutral-400 font-medium">Model: OpenAI GPT-4o • Context-Aware</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-neutral-900 text-white font-medium rounded-tr-xs'
                      : 'bg-neutral-50 text-neutral-800 border border-neutral-200/60 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 italic">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>AI Assistant is analyzing...</span>
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-3 border-t border-neutral-100">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about emissions, scope 1-3 reduction, or formula rules..."
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-purple-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: AI Tools Column */}
        <div className="space-y-6">
          {/* AI Category Classifier */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900">AI Category & Scope Classifier</h3>
            </div>
            <input
              type="text"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="e.g. 5,000 Litres Diesel for On-Road Logistics Fleet"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleTestCategory}
              disabled={descLoading || !descInput.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              {descLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Test AI Categorization</span>
            </button>

            {descResult && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-purple-900">Category: {descResult.category}</div>
                <div className="text-purple-700 font-semibold text-[11px]">
                  Scope: {descResult.scope} • Confidence: {(descResult.confidence * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>

          {/* Anomaly & Duplicate Detection Trigger */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-neutral-900">Data Integrity AI Scan</h3>
              </div>
            </div>
            <button
              onClick={handleRunDetections}
              disabled={detectionLoading}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              {detectionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
              <span>Run AI Anomaly & Duplicate Scan</span>
            </button>

            {anomalies.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{anomalies.length} Outlier Anomaly Detected</span>
                </div>
                <p className="text-[11px] text-rose-700">{anomalies[0]?.reason}</p>
              </div>
            )}

            {duplicates.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1">
                  <CopyCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>{duplicates.length} Duplicate Entry Pair Detected</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
