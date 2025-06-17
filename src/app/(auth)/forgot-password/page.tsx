import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPassword() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-gray-500">Enter your email to reset your password</p>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="name@example.com" required type="email" />
          </div>
          <Button className="w-full" type="submit">
            Send Reset Link
          </Button>
        </form>
        <div className="text-center text-sm">
          Remember your password?{" "}
          <Link className="underline" href="/sign-in/admin">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

