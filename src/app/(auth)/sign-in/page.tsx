"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-provider"
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { LoginFormSchema } from "@/lib/schemas/schemas"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useLoader } from "@/context/loader-provider"
import { LoginFormType } from "@/types/form"
import { cn } from "@/lib/utils/utils"

const RESEND_COUNTDOWN_TIME = 30

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
    return () => { if (timer) clearInterval(timer) }
  }, [isOpen, isResendDisabled])

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Reset Password</DialogTitle>
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-1">
            We sent a password reset link to
          </p>
          <p className="text-sm font-medium text-foreground mb-6">{email || "your email"}</p>

          <div className="flex items-center justify-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Didn&apos;t receive the link?</span>
            <button
              onClick={!isResendDisabled ? handleResendClick : undefined}
              disabled={isResendDisabled}
              className={cn(
                "font-medium transition-colors",
                isResendDisabled
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-primary hover:text-primary-700 cursor-pointer"
              )}
            >
              {isResendDisabled ? `Resend in ${countdown}s` : "Resend link"}
            </button>
          </div>
        </div>
        <div className="bg-muted/50 px-6 py-3 flex justify-center border-t border-border">
          <Button variant="outline" onClick={handleClose} className="min-w-[120px]">
            Close
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
    defaultValues: { username: "", password: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  const { handleSubmit, formState: { errors, isSubmitting }, register } = form

  const handleFormSubmit: SubmitHandler<LoginFormType> = async (values) => {
    try {
      setIsLoading(true)
      showLoader()
      await signIn(values.username, values.password)
    } catch {
      // error handled by auth provider
    } finally {
      setIsLoading(false)
      hideLoader()
    }
  }

  const busy = isLoading || isSubmitting

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="username"
                  type="email"
                  placeholder="name@company.com"
                  disabled={busy}
                  className="pl-10 h-11"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs text-primary hover:text-primary-700 font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  disabled={busy}
                  className="pl-10 pr-10 h-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11 text-base font-medium"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        email={form.getValues("username")}
      />
    </>
  )
}

export default SignIn
