"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.userid; // Extract user ID from URL

  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Tracks edit mode

  // Fetch user profile on page load
  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    if (!userId) {
      setMessage("Error: No user ID found in URL.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, username, profile_picture")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (!data) {
        setMessage("No profile found for this user.");
        return;
      }

      setProfile(data);
      setUsername(data.username);
      setProfilePic(data.profile_picture);
    } catch (error: any) {
      setMessage("Unexpected error occurred.");
    }
  }

  // Handle Profile Picture Upload
  async function handleProfilePicUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `profile_pictures/${fileName}`;

      console.log("Uploading file:", fileName);
  
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("profile_pictures")
        .upload(filePath, file, { upsert: true });
  
      if (error) throw error;
  
      // const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile_pictures/${fileName}`;

      const { data: publicUrlData } = await supabase.storage
      .from("profile_pictures")
      .getPublicUrl(filePath);

    let imageUrl = publicUrlData.publicUrl;

    console.log("Generated Image URL:", imageUrl);
    imageUrl = `${imageUrl}?timestamp=${new Date().getTime()}`;

      // Update database with new image URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_picture: imageUrl })
        .eq("id", userId);

      if (updateError) throw updateError;
      setProfilePic(imageUrl);
      setMessage("Profile picture updated successfully!");
    } catch (error: any) {
      setMessage("Error uploading profile picture.");
    } finally {
      setUploading(false);
    }
  }

  // Handle Username Update
  async function handleSaveChanges() {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", userId);

      if (error) throw error;
      setMessage("Profile updated successfully!");
      setIsEditing(false); // Exit edit mode
      fetchProfile(); // Refresh profile data
      setTimeout(() => setMessage(""), 2000);

    } catch (error: any) {
      setMessage("Error updating profile.");
    }
  }

  // Handle Password Reset
  async function handleResetPassword() {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
      if (error) throw error;
      setMessage("Password reset email sent.");
    } catch (error: any) {
      setMessage("Error sending password reset email.");
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-center">Profile</h1>

      {profile ? (
        <>
          <div className="text-center">
            <Image
              src={profilePic || "/default-avatar.png"}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full mx-auto"
            />
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="mt-2 text-sm"
                disabled={uploading}
              />
            )}
          </div>

          <div>
            <Label>Email</Label>
            <Input value={profile.email} disabled />
          </div>

          <div>
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            {isEditing ? (
              <Button onClick={handleSaveChanges} className="bg-green-500 hover:bg-green-600">
                Save
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600">
                Edit
              </Button>
            )}
            <Button onClick={handleResetPassword} className="bg-red-500 hover:bg-red-600">
              Reset Password
            </Button>
          </div>

          {message && <p className="text-center text-sm mt-2 text-red-500">{message}</p>}
        </>
      ) : (
        <p className="text-center text-sm text-red-500">{message || "Loading profile..."}</p>
      )}
    </div>
  );
}
