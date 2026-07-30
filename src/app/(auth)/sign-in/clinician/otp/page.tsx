"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"

const OTP_LENGTH = 6

const ClinicianOTPPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (countdown === 0) setCanResend(true)
  }, [countdown, canResend])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.some(d => !d)) return
    setIsLoading(true)
    // TODO: verify OTP
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleResend = () => {
    setCanResend(false)
    setCountdown(30)
    setOtp(Array(OTP_LENGTH).fill(""))
    inputRefs.current[0]?.focus()
  }

  const isValid = otp.every(d => d)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Verify OTP</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Enter the 6-digit code sent to your registered device
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-lg border border-input bg-background text-foreground
                  focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all
                  disabled:opacity-50"
              />
            ))}
          </div>

          <Button type="submit" disabled={isLoading || !isValid} className="w-full h-11 text-base font-medium">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Verify
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm text-primary hover:text-primary-700 font-medium transition-colors cursor-pointer"
            >
              Resend code
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Resend code in <span className="font-medium text-foreground">{countdown}s</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ClinicianOTPPage
