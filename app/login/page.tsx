"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const user = userData?.user;
      if (!user) throw new Error("Failed to fetch user data.");
      
      setMessage("Login successful! Redirecting...");
      // router.push("/dashboard"); // Redirect to user dashboard
      router.push(`/dashboard/${user.id}`); // ✅ Redirect to user-specific dashboard
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-primary">Log in to Gator Marketplace</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </div>
      </form>
      {message && <p className="text-center text-sm mt-2 text-red-500">{message}</p>}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          <Link href="/reset-password" className="font-medium text-primary hover:text-primary/90">
            Forgot your password?
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:text-primary/90">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
