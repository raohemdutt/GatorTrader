"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { MessageCircleIcon, XIcon } from "lucide-react";

const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MessagesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pricingMode, setPricingMode] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
      } else {
        setAuthorized(true);
      }
    }

    checkUser();
  }, []);

  const sendMessage = async (prompt: string, displayMessage?: string) => {
    setMessages((prev) => [...prev, `You: ${displayMessage || prompt}`]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, `Bot: ${data.response}`]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [...prev, "Bot: Sorry, there was an error."]);
    }

    setLoading(false);
  };

  const handlePrompt = (prompt: string) => {
    setPricingMode(false);
    setInput("");
    sendMessage(prompt);
  };

  const handlePriceMode = () => {
    setMessages((prev) => [
      ...prev,
      `Bot: What item would you like a price for?`,
    ]);
    setPricingMode(true);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = input.trim();
    if (userInput === "") return;

    if (pricingMode) {
      const prompt = `What is the average price for a ${userInput}? Please provide a range and keep the response to be under 50 words.`;

      sendMessage(prompt, userInput);

      setPricingMode(false);
    } else {
      sendMessage(userInput);
    }

    setInput("");
  };

  if (!authorized) return null;

  return (
    <>
      <Chat />
      <button
        onClick={() => setShowBot(!showBot)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition"
      >
        {showBot ? <XIcon size={24} /> : <MessageCircleIcon size={24} />}
      </button>

      {showBot && (
        <div className="fixed bottom-20 right-6 bg-white shadow-xl rounded-lg w-96 p-4 border z-50 max-h-[80vh] overflow-auto flex flex-col">
          <h2 className="font-semibold mb-2">AI Chatbot</h2>

          <div className="space-y-2 mb-4">
            <button
              onClick={() =>
                handlePrompt(
                  "Where is a good place to meet up to exchange items?"
                )
              }
              className="w-full bg-gray-100 hover:bg-gray-200 p-2 rounded"
            >
              Where is a good place to meet up to exchange items?
            </button>
            <button
              onClick={handlePriceMode}
              className="w-full bg-gray-100 hover:bg-gray-200 p-2 rounded"
            >
              Help me find the average item price range.
            </button>
          </div>

          <div className="bg-gray-50 p-2 mb-2 rounded overflow-y-auto grow">
            {messages.map((msg, i) => (
              <p key={i} className="text-sm mb-1">
                {msg}
              </p>
            ))}
            {loading && <p className="text-sm italic">Bot is typing...</p>}
          </div>

          {pricingMode && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Enter item name (e.g., keyboard)..."
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
