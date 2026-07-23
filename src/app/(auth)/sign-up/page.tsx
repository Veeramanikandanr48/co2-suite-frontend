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
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { SignUpSchema } from "@/lib/schemas";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (_values: SignUpFormValues) => {
    try {
      setSubmitting(true);
      // Process registration submission
      showSuccessToast("Account created successfully! Please check your email for verification.");
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-sm space-y-6 px-4 py-8 bg-white border border-slate-200 rounded-2xl shadow-lg">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500">Enter your details to create your enterprise account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Alex Morgan" className="h-9 text-xs" />
                  </FormControl>
                  <FormMessage className="text-rose-500 text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Work Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="name@company.com" className="h-9 text-xs" />
                  </FormControl>
                  <FormMessage className="text-rose-500 text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-9 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-500 text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Confirm Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-9 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-500 text-[11px]" />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submitting} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer">
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{" "}
          <Link className="font-semibold text-emerald-600 hover:underline" href="/sign-in">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
