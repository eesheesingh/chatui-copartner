import React, { useState } from 'react';

const ChatInput = ({ sendMessage }) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ type: 'text', content: input });
      setInput('');
    } else if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage({ type: file.type.startsWith('image/') ? 'image' : 'file', content: reader.result });
      };
      reader.readAsDataURL(file);
      setFile(null);
    }
  };

  return (
    <div className="p-4 bg-gray-100 flex">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        className="flex-1 p-2 border rounded mr-2"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="hidden"
        id="fileInput"
      />
      <label htmlFor="fileInput" className="bg-gray-500 text-white p-2 rounded cursor-pointer mr-2">
        Attach
      </label>
      <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded">Send</button>
    </div>
  );
};

export default ChatInput;
