// src/Chat.js
import React, { useEffect, useRef, useState } from 'react';

function Chat() {
  const [email, setEmail] = useState('');
  const chatContainerRef = useRef(null);
  const [talkSession, setTalkSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

// Define an array of 10 image URLs
const images = [
  "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fprofile-avatar&psig=AOvVaw2GWdy7lbm1JJBte2LT3MaR&ust=1743540557336000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCODkk_GYtYwDFQAAAAAdAAAAABAE",
  "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Fso%2Fuser-avatar&psig=AOvVaw2GWdy7lbm1JJBte2LT3MaR&ust=1743540557336000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCODkk_GYtYwDFQAAAAAdAAAAABAI",
  "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Ffree-png-vectors%2Fuser-avatar&psig=AOvVaw2GWdy7lbm1JJBte2LT3MaR&ust=1743540557336000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCODkk_GYtYwDFQAAAAAdAAAAABAP",
  "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngegg.com%2Fen%2Fsearch%3Fq%3Dman%2Bavatar&psig=AOvVaw2GWdy7lbm1JJBte2LT3MaR&ust=1743540557336000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCODkk_GYtYwDFQAAAAAdAAAAABAW"
];

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
    // Check if email is provided
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    // Validate email: must be a valid @ufl.edu email (case insensitive)
    if (!email.toLowerCase().endsWith('@ufl.edu')) {
      alert("Please enter a valid @ufl.edu email address");
      return;
    }

    if (!talkSession || !currentUser) {
      alert("Chat is not ready yet. Please try again later.");
      return;
    }

    //Radomly select a photo from the images array
    const randomPhoto = images[Math.floor(Math.random() * images.length)];
    // Create a dummy user based on the entered email
    const otherUser = new window.Talk.User({
      id: email, // In production, use a unique user id from your database
      name: email.split("@")[0],
      email: email,
      photoUrl: randomPhoto, // Use the randomly selected photo URL
      welcomeMessage: "Hi there! Let's chat."
    });

    // Create a unique one-on-one conversation
    const conversationId = window.Talk.oneOnOneId(currentUser, otherUser);
    const conversation = talkSession.getOrCreateConversation(conversationId);
    conversation.setParticipant(currentUser);
    conversation.setParticipant(otherUser);

    // Create and mount the inbox UI for the selected conversation
    const inbox = talkSession.createInbox({ selected: conversation });
    inbox.mount(chatContainerRef.current);
  };

  return (
    <div 
      style={{
        background: 'linear-gradient(45deg, #0021A5, #FA4616, #0021A5)',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Enter target user's email"
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
        style={{
          width: '90%',
          height: '500px',
          margin: '30px auto',
          border: '1px solid #ccc',
          backgroundColor: '#fff'
        }}
      >
        Loading chat...
      </div>
    </div>
  );
}

export default Chat;
