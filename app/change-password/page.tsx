"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChangePassword() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Get current user session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session.session) throw new Error("User not authenticated.");

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard"); // Redirect to dashboard after success
      }, 2000);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <h2 className="text-center text-3xl font-bold">Change Password</h2>
      <form onSubmit={handleChangePassword} className="space-y-6">
        <Input
          type="password"
          placeholder="Enter New Password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </Button>
      </form>
      {message && <p className="text-center text-red-500">{message}</p>}
    </div>
  );
}
