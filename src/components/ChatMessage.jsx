import React from 'react';

const ChatMessage = ({ message }) => {
  return (
    <div className={`mb-4 ${message.isSender ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block p-2 rounded-lg ${message.isSender ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
        {message.type === 'text' && <span>{message.content}</span>}
        {message.type === 'image' && <img src={message.content} alt="Sent image" className="max-w-xs" />}
        {message.type === 'file' && (
          <a href={message.content} download className="text-blue-500 underline">
            Download File
          </a>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
