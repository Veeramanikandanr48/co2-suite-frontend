"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-provider"
import {
  EyeIcon,
  EyeOffIcon,
  Loader2,
  X,
  ShieldCheck,
  Leaf,
  Activity,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  Globe2,
  ArrowRight,
  TrendingDown
} from "lucide-react"
import FormInput from "~/components/reusables/form-fields/form-input"
import { FORM_DEFAULT_VALUES } from "~/lib/variables"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { LoginFormSchema } from "~/lib/schemas"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { LOGIN_TEST_IDS } from "~/components/test-ids/login-ids"
import { useLoader } from "@/context/loader-context"
import { LoginFormType } from "@/types/form"

const RESEND_COUNTDOWN_TIME = 30

// Forgot Password Modal Component
const ForgotPasswordModal = ({ isOpen, onClose, email }: { isOpen: boolean; onClose: () => void; email?: string }) => {
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_TIME)
  const [isResendDisabled, setIsResendDisabled] = useState(true)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isOpen && isResendDisabled) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsResendDisabled(false)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen, isResendDisabled])

  if (!isOpen) return null

  const handleResendClick = () => {
    setIsResendDisabled(true)
    setCountdown(RESEND_COUNTDOWN_TIME)
  }

  const handleClose = () => {
    setIsResendDisabled(true)
    setCountdown(RESEND_COUNTDOWN_TIME)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent
        data-testid={LOGIN_TEST_IDS.FORGOT_PASSWORD_MODAL}
        className="bg-white border border-slate-200 text-slate-900 p-8 rounded-2xl shadow-2xl max-w-md w-full sm:rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <button
          data-testid={LOGIN_TEST_IDS.MODAL_CLOSE_ICON}
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Mail className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Password Reset Requested</h2>
            <p className="text-sm text-slate-500">
              We&apos;ve dispatched a secure recovery link to
            </p>
            <p className="text-sm font-semibold text-emerald-600 break-all">{email || "your registered email"}</p>
          </div>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
            <span>Didn&apos;t receive the link?</span>
            <button
              data-testid={LOGIN_TEST_IDS.RESEND_LINK_BUTTON}
              onClick={!isResendDisabled ? handleResendClick : undefined}
              disabled={isResendDisabled}
              className={`font-semibold transition-colors ${
                isResendDisabled
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-emerald-600 hover:text-emerald-700 cursor-pointer"
              }`}
              tabIndex={isResendDisabled ? -1 : 0}
              aria-disabled={isResendDisabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  if (!isResendDisabled) handleResendClick()
                }
              }}
            >
              {isResendDisabled ? `Resend in ${countdown}s` : "Resend email"}
            </button>
          </div>

          <Button
            data-testid={LOGIN_TEST_IDS.MODAL_CLOSE_BUTTON}
            onClick={handleClose}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Return to Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const { signIn } = useAuth()
  const { showLoader, hideLoader } = useLoader()

  const form = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: FORM_DEFAULT_VALUES.loginForm,
    mode: "onBlur",
    reValidateMode: "onChange",
    criteriaMode: "all",
  })

  const { handleSubmit, formState: { isDirty } } = form

  const handleFormSubmit: SubmitHandler<LoginFormType> = async (values) => {
    try {
      setIsLoading(true)
      await signIn(values.username, values.password)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) {
      showLoader()
    } else {
      hideLoader()
    }
  }, [isLoading, showLoader, hideLoader])

  const togglePasswordVisibility = () => setShowPassword(prev => !prev)

  return (
    <div className="min-h-screen w-full bg-slate-50 flex text-slate-900 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full grid lg:grid-cols-12 min-h-screen z-10">
        
        {/* LEFT COLUMN: Vivid Enterprise Hero Background Image & Glassmorphism Overlay */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 lg:p-16 relative border-r border-slate-200/80 overflow-hidden">
          
          {/* Prominent High-Resolution Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.png"
              alt="Enterprise Carbon Telemetry Hero Background"
              fill
              priority
              className="object-cover object-center opacity-90 scale-105 transition-transform duration-1000"
            />
            {/* Subtle Gradient Vignette Overlay to maintain contrast & legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-950/50 backdrop-blur-[1px]" />
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
              <Leaf className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-wider text-white text-lg drop-shadow-sm">CO2 SUITE</span>
                <span className="text-[10px] font-semibold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full backdrop-blur-md">
                  Enterprise v2.4
                </span>
              </div>
              <p className="text-xs text-slate-300 drop-shadow-sm">Carbon Telemetry & Decarbonization Intelligence</p>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 my-auto py-12 space-y-8 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-semibold text-emerald-300 shadow-md backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Next-Gen Enterprise Sustainability Platform</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
              Accelerate Net-Zero Transformation with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">Real-Time Intelligence</span>
            </h1>

            <p className="text-slate-200 text-base leading-relaxed drop-shadow-sm font-normal">
              Unified GHG Protocol accounting, IoT emission sensor integration, and automated ESG disclosure reporting built for multi-site global enterprises.
            </p>

            {/* Live Metrics Grid (Glassmorphism over Vivid Background) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl backdrop-blur-md space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span>Carbon Tracked</span>
                  <Activity className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">4.2M <span className="text-xs font-medium text-slate-400">tCO2e</span></div>
                <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold">
                  <TrendingDown className="h-3 w-3" />
                  <span>18.4% reduction YoY</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl backdrop-blur-md space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span>Audit Assurance</span>
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">100% <span className="text-xs font-medium text-slate-400">ISO 14064</span></div>
                <div className="flex items-center space-x-1 text-[11px] text-teal-400 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Big-4 Audit Verified</span>
                </div>
              </div>
            </div>

            {/* Key Feature List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-200 font-medium drop-shadow-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-400/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span>Automated Scope 1, 2, and 3 emission factors aggregation</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-200 font-medium drop-shadow-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-400/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span>Predictive decarbonization scenario modeling with AI</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Trust Bar */}
          <div className="relative z-10 pt-6 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-medium text-white">SOC 2 Type II Certified</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <Globe2 className="h-4 w-4 text-teal-400" />
                <span className="font-medium text-white">ISO 27001 Compliant</span>
              </div>
            </div>
            <span className="text-slate-400">256-bit AES Encrypted</span>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Enterprise Sign In Form */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white">
          
          {/* Mobile Top Brand (Visible only on smaller screens) */}
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
            
            {/* Form Header */}
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

            {/* Main Login Form */}
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
                      className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-semibold hover:underline"
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
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

            {/* Quick Security Info & Disclaimer */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-slate-600 flex items-start space-x-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                Unauthorized access is strictly prohibited and monitored under enterprise security compliance policies.
              </span>
            </div>

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
  )
}

export default SignIn
