"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for password confirmation
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

        // Step 1: Validate email format (must be @ufl.edu)
        if (!email.endsWith("@ufl.edu")) {
          setMessage("Only @ufl.edu emails are allowed.");
          setLoading(false);
          return;
        }
    
        // Step 2: Ensure passwords match
        if (password !== confirmPassword) {
          setMessage("Passwords do not match.");
          setLoading(false);
          return;
        }
        
    try {
    
      const { data: existingUsers, error: fetchError } = await supabase
        .from("registered_users")
        .select("email")
        .eq("email", email);

      if (fetchError) throw fetchError;

      if (existingUsers && existingUsers.length > 0) {
        setMessage("This email is already registered. Please log in instead.");
        setLoading(false);
        return;
      }

      // Step 1: Sign up user with Supabase Auth (No username field)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
  
      setMessage("Account created successfully! Check your email to verify.");
      setTimeout(() => {
        router.push("/about");
      }, 2000);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-primary">Create Your Account</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </div>
      </form>
      {message && <p className="text-center text-sm mt-2 text-red-500">{message}</p>}
      <div className="text-center">
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-secondary hover:text-secondary/90">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
