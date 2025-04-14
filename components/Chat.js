"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/solid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Chat() {
  const chatContainerRef = useRef(null);
  const [talkSession, setTalkSession] = useState(null);
  const [talkUser, setTalkUser] = useState(null);
  const [inbox, setInbox] = useState(null);
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!user || userError) {
        alert('You must be logged in to use chat.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, profile_picture')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        alert('Could not load your profile.');
        return;
      }

      const me = new window.Talk.User({
        id: user.id,
        name: profile.username || user.email,
        email: user.email,
        photoUrl: profile.profile_picture || 'https://demo.talkjs.com/img/alice.jpg',
        welcomeMessage: 'Hey there!',
      });

      const session = new window.Talk.Session({
        appId: 'tu3aoShQ',
        me,
      });

      const inboxInstance = session.createInbox({ showChatHeader: true });
      inboxInstance.mount(chatContainerRef.current);

      setTalkSession(session);
      setTalkUser(me);
      setInbox(inboxInstance);
    })();
  }, []);

  useEffect(() => {
    const sellerEmail = searchParams.get("sellerEmail");
    if (sellerEmail && talkUser && talkSession) {
      startChatWith(sellerEmail);
    }
  }, [searchParams, talkUser, talkSession]);

  const startChatWith = async (email) => {
    const { data: otherUser } = await supabase
      .from('profiles')
      .select('id, username, profile_picture')
      .eq('email', email)
      .single();

    if (!otherUser) {
      alert('No user found with that email.');
      return;
    }

    const otherTalkUser = new window.Talk.User({
      id: otherUser.id,
      name: otherUser.username || email,
      email,
      photoUrl: otherUser.profile_picture || 'https://demo.talkjs.com/img/bob.jpg',
      welcomeMessage: 'Hi there!',
    });

    const conversationId = window.Talk.oneOnOneId(talkUser, otherTalkUser);
    const conversation = talkSession.getOrCreateConversation(conversationId);
    conversation.setParticipant(talkUser);
    conversation.setParticipant(otherTalkUser);

    if (inbox) inbox.select(conversation);
  };

  const startManualChat = () => {
    if (!targetEmail.toLowerCase().endsWith('@ufl.edu')) {
      alert('Please enter a valid @ufl.edu email');
      return;
    }
    startChatWith(targetEmail);
    setShowNewChatInput(false);
    setTargetEmail('');
  };

  return (
    <div className="w-full h-screen bg-gradient-to-tr from-blue-800 via-orange-600 to-blue-800 relative">
      {/* Custom "New Chat" Button */}
      <button
        onClick={() => setShowNewChatInput(true)}
        className="absolute top-4 right-4 bg-white text-blue-700 p-2 rounded-full shadow hover:bg-blue-700 hover:text-white z-20"
        title="Start New Chat"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* TalkJS Inbox */}
      <div
        ref={chatContainerRef}
        className="w-full h-full bg-white border shadow"
      />

      {/* New Chat Modal */}
      {showNewChatInput && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-30">
          <div className="bg-white rounded p-6 shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Start a New Chat</h2>
            <input
              type="text"
              placeholder="Enter @ufl.edu email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewChatInput(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={startManualChat}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
