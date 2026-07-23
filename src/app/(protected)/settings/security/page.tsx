"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { unwrapApiResponse, extractErrorMessage } from "@/lib/api-utils";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  KeyRound,
  ShieldOff,
  ArrowRight,
} from "lucide-react";

export default function SecurityPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [disabling, setDisabling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mfaData, setMfaData] = useState<{ qrcode: string; secretKey: string } | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");

  // Fetch self 2FA setup details & current status
  const fetchSelf2FA = async () => {
    try {
      setLoading(true);
      const [meRes, mfaRes] = await Promise.all([
        apiService.get<unknown>(API_LIST.GET_ME),
        apiService.get<unknown>(API_LIST.GET_SELF_2FA),
      ]);

      const meObj = unwrapApiResponse<{ isTwoFactorAuthenticationEnabled?: boolean }>(meRes);
      if (meObj) {
        setIs2FAEnabled(!!meObj.isTwoFactorAuthenticationEnabled);
      }

      const mfaObj = unwrapApiResponse<{ qrcode: string; secretKey: string; isTwoFactorAuthenticationEnabled?: boolean }>(mfaRes);
      if (mfaObj) {
        setMfaData(mfaObj);
        if (mfaObj.isTwoFactorAuthenticationEnabled !== undefined) {
          setIs2FAEnabled(!!mfaObj.isTwoFactorAuthenticationEnabled);
        }
      }
    } catch (error: unknown) {
      console.error("Failed to load self 2FA details:", error);
      showErrorToast("Failed to load 2FA configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelf2FA();
  }, []);

  // Verify TOTP Code to Enable 2FA
  const handleVerifyAndEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      showErrorToast("Please enter a valid 6-digit verification code");
      return;
    }

    try {
      setVerifying(true);
      await apiService.post(API_LIST.VERIFY_SELF_2FA, {
        code: verificationCode.trim(),
        secretKey: mfaData?.secretKey,
      });

      setIs2FAEnabled(true);
      setVerificationCode("");
      showSuccessToast("Two-Factor Authentication verified and enabled successfully!");
      fetchSelf2FA();
    } catch (error: unknown) {
      showErrorToast(extractErrorMessage(error, "Invalid 2FA Verification Code. Please try again."));
    } finally {
      setVerifying(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    try {
      setDisabling(true);
      await apiService.post(API_LIST.DISABLE_SELF_2FA, {});
      setIs2FAEnabled(false);
      showSuccessToast("Two-Factor Authentication has been disabled");
      fetchSelf2FA();
    } catch (error: unknown) {
      showErrorToast(extractErrorMessage(error, "Failed to disable 2FA"));
    } finally {
      setDisabling(false);
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
            Protect your account with TOTP Two-Factor Authentication using your Authenticator App.
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
          <span>Loading 2FA security configuration...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 py-2 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Status & Banner Info */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Two-Factor Authenticator (TOTP)
              </h2>
              <p className="text-xs text-neutral-500 max-w-xl">
                When enabled, sign-in requires your password plus a 6-digit verification code generated by your Authenticator app (Google Authenticator, Authy, 1Password).
              </p>
            </div>

            {is2FAEnabled && (
              <Button
                type="button"
                onClick={handleDisable2FA}
                disabled={disabling}
                className="h-9 px-4 text-xs font-semibold shadow-xs cursor-pointer shrink-0 gap-1.5 bg-rose-600 hover:bg-rose-500 text-white"
              >
                {disabling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                <span>Disable 2FA</span>
              </Button>
            )}
          </div>

          {/* If 2FA IS ENABLED: Active Status Component */}
          {is2FAEnabled ? (
            <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Two-Factor Authentication is Active
                </h3>
                <p className="text-xs text-neutral-500 max-w-md">
                  Your account is protected. Every sign-in request will prompt for a 6-digit TOTP code from your mobile authenticator app.
                </p>
              </div>
            </div>
          ) : (
            /* If 2FA IS DISABLED: Setup & Verification Flow */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Step-by-Step Setup Guide & Verification Form */}
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    2FA Activation Steps
                  </h3>
                </div>

                <ol className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-neutral-900 dark:text-white">Install an Authenticator App</strong>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Download Google Authenticator, Authy, or Microsoft Authenticator.
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
                        Scan the code on the right with your phone camera inside the app.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-neutral-900 dark:text-white">Enter Code to Verify & Enable</strong>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Type the 6-digit code shown in your app below to complete setup.
                      </p>
                    </div>
                  </li>
                </ol>

                {/* STEP 3: VERIFICATION FORM */}
                <form onSubmit={handleVerifyAndEnable2FA} className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Verification Code *
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="h-10 text-center font-mono text-lg font-bold tracking-[0.4em] bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={verifying || verificationCode.length !== 6}
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-xs gap-1.5"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying TOTP Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Enable 2FA</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Right Column: QR Code & Secret Key Display */}
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
          )}
        </div>
      )}
    </div>
  );
}
