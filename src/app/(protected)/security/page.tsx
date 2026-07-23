"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Loader2,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SecurityPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mfaData, setMfaData] = useState<{ qrcode: string; secretKey: string } | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);

  // Fetch self 2FA setup QR details & status
  useEffect(() => {
    async function fetchSelf2FA() {
      try {
        setLoading(true);
        const [meRes, mfaRes] = await Promise.all([
          apiService.get<any>(API_LIST.GET_ME),
          apiService.get<any>(API_LIST.GET_SELF_2FA),
        ]);

        const meObj = (meRes as any)?.data ?? meRes;
        if (meObj) {
          setIs2FAEnabled(!!meObj.isTwoFactorAuthenticationEnabled);
        }

        const mfaObj = (mfaRes as any)?.data ?? mfaRes;
        if (mfaObj) {
          setMfaData(mfaObj);
        }
      } catch (error: any) {
        console.error("Failed to load self 2FA details:", error);
        showErrorToast("Failed to load 2FA configuration");
      } finally {
        setLoading(false);
      }
    }
    fetchSelf2FA();
  }, []);

  const handleToggleSelf2FA = async () => {
    try {
      setToggling(true);
      const res: any = await apiService.put(API_LIST.TOGGLE_SELF_2FA, {});
      const data = res?.data ?? res;
      const newStatus = !!data?.isTwoFactorAuthenticationEnabled;
      setIs2FAEnabled(newStatus);
      showSuccessToast(`Two-Factor Authentication is now ${newStatus ? "ENABLED" : "DISABLED"}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to update 2FA status";
      showErrorToast(msg);
    } finally {
      setToggling(false);
    }
  };

  const handleCopySecret = () => {
    if (!mfaData?.secretKey) return;
    navigator.clipboard.writeText(mfaData.secretKey);
    setCopied(true);
    showSuccessToast("Secret Key copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-4 p-1 text-neutral-900 dark:text-neutral-100 w-full">
      {/* Top Header Bar */}
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Security & Two-Factor Authentication (2FA)
            </h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure self-service TOTP Two-Factor Authentication to protect your account login.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`px-3 py-1 font-semibold text-xs gap-1.5 ${
            is2FAEnabled
              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              : "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
          }`}
        >
          {is2FAEnabled ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> 2FA Active
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" /> 2FA Disabled
            </>
          )}
        </Badge>
      </div>

      {/* Main Workspace Body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-xs text-neutral-500 gap-2 flex-1">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Loading 2FA setup details...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 py-2 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Status & Toggle Action Banner */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Two-Factor Authenticator (TOTP)
              </h2>
              <p className="text-xs text-neutral-500 max-w-xl">
                When enabled, sign-in requires your password plus a 6-digit verification code generated by your Authenticator app (e.g. Google Authenticator, Authy, 1Password).
              </p>
            </div>

            <Button
              type="button"
              onClick={handleToggleSelf2FA}
              disabled={toggling}
              className={`h-9 px-4 text-xs font-semibold shadow-xs cursor-pointer shrink-0 gap-1.5 ${
                is2FAEnabled
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {toggling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {is2FAEnabled ? "Disable 2FA" : "Enable 2FA Now"}
            </Button>
          </div>

          {/* Setup Instructions & QR Code Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Step-by-Step Instructions */}
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  How to Set Up Authenticator App
                </h3>
              </div>

              <ol className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-white">Download an Authenticator App</strong>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Install Google Authenticator, Authy, or Microsoft Authenticator on your mobile phone.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-white">Scan the QR Code</strong>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Open your Authenticator app, choose "Scan QR Code", and frame the code shown on the right.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-white">Or Enter Secret Key Manually</strong>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      If your camera is unavailable, type or copy the Secret Key into your app settings.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Right Column: QR Code & Secret Key Box */}
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 w-full justify-center">
                <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Your Personal 2FA QR Code
                </h3>
              </div>

              {mfaData?.qrcode ? (
                <div className="p-3 bg-white border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mfaData.qrcode} alt="Self 2FA QR Code" className="w-44 h-44" />
                </div>
              ) : (
                <div className="w-44 h-44 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex items-center justify-center text-xs text-neutral-400">
                  No QR Code Available
                </div>
              )}

              {mfaData?.secretKey && (
                <div className="w-full space-y-1.5 text-left pt-1">
                  <p className="text-[11px] font-semibold text-neutral-500">Secret Key (Manual Entry):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all select-all border border-neutral-200 dark:border-neutral-700">
                      {mfaData.secretKey}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySecret}
                      className="h-8.5 px-3 text-xs shrink-0 cursor-pointer gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
