// src/Chat.js
import React, { useEffect, useRef, useState } from 'react';

function Chat() {
  const [email, setEmail] = useState('');
  const chatContainerRef = useRef(null);
  const [talkSession, setTalkSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if(!window.Talk) {
      console.error('TalkJS script not loaded yet.');
      return;
    }
    if(!window.Talk.ready) {
      console.error("TalkJS script is still loading. Please wait for it to load before calling Talk.ready.");
      return;
    }
    // Wait for TalkJS to be ready
    window.Talk.ready.then(() => {
      // Create the current user (replace with your authenticated user's info)
      const me = new window.Talk.User({
        id: "1", // Unique identifier for the current user
        name: "Current User",
        email: "current@example.com",
        photoUrl: "https://demo.talkjs.com/img/alice.jpg",
        welcomeMessage: "Hello! How can I help you today?"
      });

      // Initialize a TalkJS session with your TalkJS App ID
      const session = new window.Talk.Session({
        appId: "tu3aoShQ", // Replace with your TalkJS App ID
        me: me
      });

      setCurrentUser(me);
      setTalkSession(session);
    });
  }, []);

  const startChat = () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }
    if (!talkSession || !currentUser) {
      alert("Chat is not ready yet. Please try again later.");
      return;
    }

    // Create a dummy user based on the entered email
    const otherUser = new window.Talk.User({
      id: email, // In production, use a unique user id from your database
      name: email.split("@")[0],
      email: email,
      photoUrl: "https://via.placeholder.com/150", // Placeholder image
      welcomeMessage: "Hi there! Let's chat."
    });

    // Create a unique one-on-one conversation
    const conversationId = window.Talk.oneOnOneId(currentUser, otherUser);
    const conversation = talkSession.getOrCreateConversation(conversationId);
    conversation.setParticipant(currentUser);
    conversation.setParticipant(otherUser);

    // Create and mount the inbox UI for the selected conversation
    const inbox = talkSession.createInbox({selected: conversation });
    inbox.mount(chatContainerRef.current);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px', width: '200px', marginRight: '10px' }}
        />
        <button onClick={startChat} style={{ padding: '8px 12px' }}>
          Start Chat
        </button>
      </div>
      <div
        ref={chatContainerRef}
        style={{ width: '90%', height: '500px', margin: '30px auto', border: '1px solid #ccc' }}
      >
        Loading chat...
      </div>
    </div>
  );
}

export default Chat;
