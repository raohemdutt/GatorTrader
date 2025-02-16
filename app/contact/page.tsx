"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage("");
  
    try {
      console.log("Submitting message:", { name, email, message });
  
      const { data, error } = await supabase.from("contact_submissions").insert([
        { name, email, message },
      ]);
  
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
  
      console.log("Data inserted successfully:", data);
  
      setSubmitMessage("Thank you for your message. We will get back to you soon!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Submission Error:", error);
      setSubmitMessage("There was an error submitting your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">Contact Us</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>

      {submitMessage && (
        <div className="mt-4 text-center text-sm">
          <p className={submitMessage.includes("error") ? "text-red-500" : "text-green-500"}>
            {submitMessage}
          </p>
        </div>
      )}
    </div>
  );
}
