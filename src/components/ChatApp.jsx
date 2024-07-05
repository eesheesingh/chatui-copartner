import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import logo from "../assets/copartner.png";
   
const contacts = [
  { name: 'Alice', img: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Bob', img: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Charlie', img: 'https://i.pravatar.cc/150?img=3' },
  { name: 'David', img: 'https://i.pravatar.cc/150?img=4' },
];

const ChatApp = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversations, setConversations] = useState({
    Alice: [],
    Bob: [],
    Charlie: [],
    David: [],
  });

  useEffect(() => {
    if (selectedContact) {
      const timer = setTimeout(() => {
        setConversations((prevConversations) => ({
          ...prevConversations,
          [selectedContact.name]: [
            ...prevConversations[selectedContact.name],
            { sender: selectedContact.name, text: 'Hello! This is an automated message.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ],
        }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedContact]);

  const handleSendMessage = (contactName, message) => {
    setConversations((prevConversations) => ({
      ...prevConversations,
      [contactName]: [...prevConversations[contactName], { sender: 'You', text: message.text, file: message.file, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
    }));
  };

  return (
    <div className="flex h-screen">
      <div className={`flex-col w-full md:w-1/3 bg-[#18181B] text-white overflow-y-auto ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        <ChatList contacts={contacts} onSelectContact={setSelectedContact} conversations={conversations} />
      </div>
      <div className={`flex-col w-full bg-[#06030E] md:w-2/3 ${selectedContact ? 'flex' : 'hidden md:flex'} border-l-[1px] border-[#ffffff48]`}>
        {selectedContact ? (
          <ChatArea
            contact={selectedContact}
            conversation={conversations[selectedContact.name]}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex justify-center items-center h-full bg-[#0F0E15]"><img src={logo} alt="Logo" /></div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
