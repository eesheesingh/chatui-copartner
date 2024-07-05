import React, { useState, useEffect, useRef } from 'react';
import { back } from '../assets';
import { IoSendSharp } from "react-icons/io5";
import { IoMdAttach } from "react-icons/io";
import { MdCancel } from "react-icons/md";

const ChatArea = ({ contact, conversation, onSendMessage, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (newMessage.trim() || selectedFile) {
      const message = {
        text: newMessage.trim(),
        file: selectedFile,
      };
      onSendMessage(contact.name, message);
      setNewMessage('');
      setSelectedFile(null);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-900 text-white flex items-center">
        <button className="md:hidden p-2 mr-4" onClick={onBack}>
          <img src={back} alt="Back" className='w-8'/>
        </button>
        <img
          src={contact.img}
          alt={contact.name}
          className="w-10 h-10 rounded-full mr-4"
        />
        <span>{contact.name}</span>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-chat-pattern">
        {conversation.map((message, index) => (
          <div key={index} className={`mb-4 ${message.sender === 'You' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-xl max-w-[80%] ${message.sender === 'You' ? 'bg-[#0088cc] text-white' : 'bg-gray-700 text-white'}`} style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {message.text && <span>{message.text}</span>}
              {message.file && (
                <img src={message.file} alt="uploaded" className="mt-2 rounded-xl max-w-full"/>
              )}
              <div className="text-xs text-gray-300 mt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {selectedFile && (
        <div className="p-4 border-t border-[#ffffff45] flex bg-gray-900 items-center gap-2 relative">
          <img src={selectedFile} alt="selected" className="rounded-xl max-w-full mx-auto"/>
          <button className="absolute top-4 right-4 bg-gray-700 text-white rounded-full p-1" onClick={removeSelectedFile}>
            <MdCancel size={24} />
          </button>
        </div>
      )}
      <div className="p-4 border-t border-[#ffffff45] flex bg-gray-900 items-center gap-2">
        <label className="ml-2 p-2 bg-gray-700 text-white rounded cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileUpload} />
          <IoMdAttach />
        </label>
        <input
          type="text"
          className="flex-grow p-2 rounded-[20px] bg-gray-700 text-white placeholder-gray-400"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="ml-2 p-2 bg-[#0088cc] text-white rounded" onClick={sendMessage}>
          <IoSendSharp />
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
