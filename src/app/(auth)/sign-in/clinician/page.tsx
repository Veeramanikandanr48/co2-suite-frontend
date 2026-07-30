"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stethoscope, ArrowRight, Loader2, Hash } from "lucide-react"

const ClinicianSignIn = () => {
  const router = useRouter()
  const [clinicianId, setClinicianId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicianId.trim()) return
    setIsLoading(true)
    // Simulate validation, then redirect to OTP
    setTimeout(() => {
      router.push("/sign-in/clinician/otp")
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
            <Stethoscope className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Clinician Portal</h2>
          <p className="text-sm text-muted-foreground mt-1.5">Enter your clinician ID to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="clinician-id" className="text-sm font-medium">Clinician ID</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="clinician-id"
                placeholder="Enter your clinician ID"
                value={clinicianId}
                onChange={(e) => setClinicianId(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !clinicianId.trim()} className="w-full h-11 text-base font-medium">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}

export default ClinicianSignIn
