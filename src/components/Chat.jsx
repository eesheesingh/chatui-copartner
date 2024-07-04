import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const Chat = () => {
  const initialChats = {
    'Chat 1': [
      { type: 'text', content: 'Hello!', isSender: true },
      { type: 'text', content: 'Hi there!', isSender: false },
    ],
    'Chat 2': [],
    'Chat 3': [],
  };

  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState('Chat 1');
  const [isChatView, setIsChatView] = useState(false);

  const sendMessage = (message) => {
    setChats({
      ...chats,
      [activeChat]: [...chats[activeChat], { ...message, isSender: true }],
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`w-full md:w-1/4 bg-gray-100 p-4 ${isChatView ? 'hidden md:block' : 'block'}`}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Chat App</h2>
        </div>
        <div className="space-y-4">
          {Object.keys(chats).map((chatName) => (
            <div
              key={chatName}
              className={`p-2 bg-white rounded shadow cursor-pointer ${activeChat === chatName ? 'bg-blue-200' : ''}`}
              onClick={() => {
                setActiveChat(chatName);
                setIsChatView(true);
              }}
            >
              {chatName}
            </div>
          ))}
        </div>
      </div>
      {/* Chat Section */}
      <div className={`flex-1 flex flex-col ${isChatView ? 'block' : 'hidden md:block'}`}>
        {/* Chat Header */}
        <div className="p-4 bg-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{activeChat}</h3>
          <button
            onClick={() => setIsChatView(false)}
            className="md:hidden text-blue-500"
          >
            Back
          </button>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {chats[activeChat].map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        </div>
        {/* Chat Input */}
        <ChatInput sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;
