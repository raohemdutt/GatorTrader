"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"; // Import the Supabase client

// // Initialize Supabase client
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("");

    try {
      // const { error } = await supabase.auth.resetPasswordForEmail(email)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/change-password",
      });
      if (error) throw error
      setMessage("Password reset email sent. Please check your inbox.")
    } catch (error) {
      setMessage("Error sending reset email. Please try again.")
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-primary">Reset Your Password</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
        <div className="rounded-md shadow-sm">
          <div>
            <Label htmlFor="email-address">Email address</Label>
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
            Send Reset Email
          </Button>
        </div>
      </form>
      {message && (
        <div className="mt-4 text-center text-sm">
          <p className={message.includes("Error") ? "text-red-500" : "text-green-500"}>{message}</p>
        </div>
      )}
    </div>
  )
}

