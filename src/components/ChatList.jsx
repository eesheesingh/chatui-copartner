import React from 'react';
import logo from "../assets/copartner.png";

const ChatList = ({ contacts, onSelectContact, conversations }) => {
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-center mb-8">
        <img src={logo} alt="Logo" className="w-40 h-12" />
      </div>
      <div className="flex items-center mb-4 p-2 bg-gray-800 rounded-lg">
        <svg
          className="w-6 h-6 text-gray-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 6h13M8 12h13m-7 6h7M3 6h.01M3 12h.01M3 18h.01"
          />
        </svg>
        <input
          type="text"
          placeholder="Search or start a new chat"
          className="w-full bg-transparent border-none text-gray-300 placeholder-gray-400 focus:ring-0"
        />
      </div>
      <div className="space-y-4">
        {contacts.map((contact, index) => {
          const lastMessage = conversations[contact.name]?.slice(-1)[0] || {};
          return (
            <div
              key={index}
              className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200"
              onClick={() => onSelectContact(contact)}
            >
              <img
                src={contact.img}
                alt={contact.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-white text-lg font-semibold">{contact.name}</span>
                  <span className="text-gray-400 text-sm">12:30</span>
                </div>
                <p className="text-gray-400 text-sm">{lastMessage.sender === 'You' ? `You: ${lastMessage.text}` : lastMessage.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
