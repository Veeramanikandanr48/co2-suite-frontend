"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { apiService } from "@/lib/api-service";
import { ForgotPasswordSchema } from "@/lib/schemas";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setSubmitting(true);
      await apiService.post("/registration/forgot-password", {
        emailId: values.email.trim(),
      });
      setSent(true);
      showSuccessToast("Password reset link sent to your email!");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to send reset email";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-sm space-y-6 px-4 py-8 bg-white border border-slate-200 rounded-2xl shadow-lg">
        <div className="space-y-1.5 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
            <Mail className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500">Enter your email to receive a secure password recovery link</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs">
              Check your inbox! We dispatched a recovery link to <strong>{form.getValues("email")}</strong>.
            </div>
            <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold">Work Email Address *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="name@company.com" className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage className="text-rose-500 text-[11px]" />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
        )}

        {!sent && (
          <div className="text-center text-xs text-slate-500 pt-2">
            Remember your password?{" "}
            <Link className="font-semibold text-emerald-600 hover:underline" href="/sign-in">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
