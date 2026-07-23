"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-provider";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2,
  ShieldCheck,
  Leaf,
  Lock,
  ArrowRight,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import FormInput from "~/components/reusables/form-fields/form-input";
import { FORM_DEFAULT_VALUES } from "~/lib/variables";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { LoginFormSchema, TotpFormSchema } from "~/lib/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LOGIN_TEST_IDS } from "~/components/test-ids/login-ids";
import { useLoader } from "@/context/loader-context";
import { LoginFormType } from "@/types/form";
import { SignInHeroColumn } from "@/components/auth/sign-in-hero-column";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";

type TOTPFormType = z.infer<typeof TotpFormSchema>;

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [show2FAInput, setShow2FAInput] = useState(false);

  const { signIn, complete2FALogin, cancel2FALogin } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const form = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: FORM_DEFAULT_VALUES.loginForm,
    mode: "onBlur",
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const totpForm = useForm<TOTPFormType>({
    resolver: zodResolver(TotpFormSchema),
    defaultValues: { code: "" },
  });

  const { handleSubmit, formState: { isDirty } } = form;

  const handleFormSubmit: SubmitHandler<LoginFormType> = async (values) => {
    try {
      setIsLoading(true);
      const res = await signIn(values.username, values.password);
      if (res?.requires2FA) {
        setShow2FAInput(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (values: TOTPFormType) => {
    try {
      setIsLoading(true);
      await complete2FALogin(values.code.trim());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel2FA = () => {
    cancel2FALogin();
    setShow2FAInput(false);
    totpForm.reset();
  };

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex text-slate-900 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full grid lg:grid-cols-12 min-h-screen z-10">
        {/* LEFT COLUMN: Hero Banner */}
        <SignInHeroColumn />

        {/* RIGHT COLUMN: Sign In Form OR 2FA Code Verification */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white">
          {/* Mobile Top Brand */}
          <div className="flex lg:hidden items-center space-x-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-wider text-slate-900 text-lg">CO2 SUITE</span>
              <p className="text-xs text-slate-500">Enterprise Carbon Intelligence</p>
            </div>
          </div>

          <div className="my-auto max-w-md w-full mx-auto space-y-8">
            {show2FAInput ? (
              /* STEP 2: 2FA TOTP VERIFICATION STEP */
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Two-Factor Verification
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your account has 2FA enabled. Please enter the 6-digit code from your Authenticator app.
                  </p>
                </div>

                <Form {...totpForm}>
                  <form onSubmit={totpForm.handleSubmit(handle2FAVerify)} className="space-y-4">
                    <FormField
                      control={totpForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-semibold text-slate-700 tracking-wide uppercase block text-center">
                            6-Digit Verification Code *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                              placeholder="000000"
                              autoFocus
                              className="h-12 text-center text-2xl font-mono tracking-[0.5em] font-bold bg-slate-50 border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500 text-xs text-center font-medium" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Sign In</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleCancel2FA}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                      </button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              /* STEP 1: STANDARD CREDENTIALS FORM */
              <>
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-600 tracking-wider uppercase">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Secure Authentication</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Enterprise Portal Login
                  </h2>
                  <p className="text-sm text-slate-500">
                    Enter your credentials to access your carbon management workspace.
                  </p>
                </div>

                <FormProvider {...form}>
                  <form
                    data-testid={LOGIN_TEST_IDS.FORM}
                    id="login-form"
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-5"
                  >
                    {/* Username Input Field */}
                    <div className="space-y-1.5">
                      <FormInput
                        data-testid={LOGIN_TEST_IDS.USERNAME_INPUT}
                        name="username"
                        label="Work Email / Username"
                        type="email"
                        placeholder="name@company.com"
                        disabled={isLoading}
                        vertical
                        className="w-full h-11 px-4 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-normal text-sm"
                        labelClassName="text-xs font-semibold text-slate-700 tracking-wide uppercase"
                      />
                    </div>

                    {/* Password Input Field */}
                    <div className="space-y-1.5">
                      <div className="relative">
                        <FormInput
                          data-testid={LOGIN_TEST_IDS.PASSWORD_INPUT}
                          name="password"
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          disabled={isLoading}
                          vertical
                          className="w-full h-11 pl-4 pr-12 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-normal text-sm"
                          labelClassName="text-xs font-semibold text-slate-700 tracking-wide uppercase"
                        />
                        <Button
                          data-testid={LOGIN_TEST_IDS.SHOW_PASSWORD_BUTTON}
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg h-7 w-7 transition-colors"
                          onClick={togglePasswordVisibility}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeIcon className="h-4 w-4" />
                          ) : (
                            <EyeOffIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Forgot Password Action */}
                      <div className="flex justify-end pt-1">
                        <button
                          data-testid={LOGIN_TEST_IDS.FORGOT_PASSWORD_BUTTON}
                          type="button"
                          onClick={() => setShowForgotPasswordModal(true)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-semibold hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    {/* Submit Action Button */}
                    <div className="pt-2">
                      <Button
                        data-testid={LOGIN_TEST_IDS.LOGIN_BUTTON}
                        type="submit"
                        disabled={isLoading || !isDirty}
                        className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to Platform</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </FormProvider>

                {/* Security Disclaimer */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-slate-600 flex items-start space-x-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Unauthorized access is strictly prohibited and monitored under enterprise security compliance policies.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Footer Copyright */}
          <div className="pt-8 text-center text-xs text-slate-400">
            © 2026 CO2 Suite Enterprise. All rights reserved.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        email={form.getValues("username")}
      />
    </div>
  );
};

export default SignIn;
