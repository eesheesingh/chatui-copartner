// import React, { useState, useEffect, useRef } from 'react';
// import { IoSendSharp } from "react-icons/io5";
// import { IoMdAttach } from "react-icons/io";
// import { MdCancel, MdDoneAll } from "react-icons/md";
// import { back, chats, ChatsWall } from '../assets';

// const ChatArea = ({ contact, conversation, onSendMessage, onBack, isOnline }) => {
//   const [newMessage, setNewMessage] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);
//   const messagesEndRef = useRef(null);

//   const sendMessage = () => {
//     if (newMessage.trim() || selectedFile) {
//       const message = {
//         text: newMessage.trim(),
//         file: selectedFile,
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       };
//       onSendMessage(contact.name, message);
//       setNewMessage('');
//       setSelectedFile(null);
//     }
//   };

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(URL.createObjectURL(file));
//     }
//   };

//   const removeSelectedFile = () => {
//     setSelectedFile(null);
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [conversation]);

//   return (
//     <div className="flex flex-col h-full bg-cover bg-center" style={{ backgroundImage: `url(${chats})` }}>
//       <div className="p-4 bg-transparent text-white flex items-center">
//         <button className="md:hidden p-2 mr-4" onClick={onBack}>
//           <img src={back} alt="Back" className='w-8'/>
//         </button>
//         <img
//           src={contact.img}
//           alt={contact.name}
//           className="w-10 h-10 rounded-full mr-4"
//         />
//         <div className="flex flex-col">
//           <span>{contact.name}</span>
//           <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
//             {isOnline ? 'Online' : 'Offline'}
//           </span>
//         </div>
//       </div>
//       <div className="flex-grow p-4 overflow-y-auto bg-[#ffffff11] rounded-[30px]" style={{ backgroundImage: `url(${ChatsWall})` }}>
//         {conversation.map((message, index) => (
//           <div key={index} className={`mb-4 flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'} items-start gap-2.5`}>
//             {message.sender !== 'You' && (
//               <img className="w-8 h-8 rounded-full" src={contact.img} alt={`${contact.name}`} />
//             )}
//             <div className={`flex flex-col w-full max-w-[320px] p-2 rounded-xl shadow-lg ${message.sender === 'You' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-gray-300 text-gray-900 rounded-tl-none'}`}>
//               <div className="flex items-center space-x-2">
//               </div>
//               {message.text && <p className="text-sm py-2.5">{message.text}</p>}
//               {message.file && (
//                 <img src={message.file} alt="uploaded" className="mt-2 rounded-xl max-w-full"/>
//               )}
//               <div className='flex justify-between text-white'>
//                 <span className="text-[10px] ">{message.timestamp}</span>
//                 <span className="text-[10px]  flex items-center gap-1">
//                   {message.status || <MdDoneAll />} {/* Use the double tick icon here */}
//                 </span>
//               </div>
//             </div>
//             {message.sender === 'You' && (
//               <img className="w-8 h-8 rounded-full" src={back} alt="You" />
//             )}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>
//       {selectedFile && (
//         <div className="p-4 border-t border-[#ffffff45] flex bg-gray-900 items-center gap-2 relative">
//           <img src={selectedFile} alt="selected" className="rounded-xl max-w-full mx-auto"/>
//           <button className="absolute top-4 right-4 bg-gray-700 text-white rounded-full p-1" onClick={removeSelectedFile}>
//             <MdCancel size={25} />
//           </button>
//         </div>
//       )}
//       <div className="p-4 border-t border-[#ffffff45] flex bg-gray-900 items-center gap-2">
//         <label className="ml-2 p-2 bg-gray-700 text-white rounded cursor-pointer">
//           <input type="file" className="hidden" onChange={handleFileUpload} />
//           <IoMdAttach />
//         </label>
//         <input
//           type="text"
//           className="flex-grow p-2 bg-transparent text-white placeholder-gray-400"
//           placeholder="Type a message"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//         />
//         <button className="ml-2 p-2 bg-[#0088cc] text-white rounded" onClick={sendMessage}>
//           <IoSendSharp />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatArea;


import React, { useState, useEffect, useRef } from 'react';
import { IoSendSharp } from "react-icons/io5";
import { IoMdAttach } from "react-icons/io";
import { MdCancel, MdDoneAll } from "react-icons/md";
import { back, chats, sender } from '../assets';

const ChatArea = ({ username, userImage, selectedContact, messages, onSendMessage, onBack, loading }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (newMessage.trim() || selectedFile) {
      const message = {
        text: newMessage.trim(),
        file: selectedFile,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'You',
      };
      onSendMessage(message);
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
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-cover bg-center" style={{ backgroundImage: `url(${chats})` }}>
      <div className="p-4 bg-transparent text-white flex items-center">
        <button className="md:hidden p-2 mr-4" onClick={onBack}>
          <img src={back} alt="Back" className='w-8'/>
        </button>
        <div className="flex items-center">
          <img src={selectedContact.img} alt={selectedContact.name} className="w-12 h-12 rounded-full mr-4 bg-[#00000052] border-[1px] border-[#fff3]"/>
          <span>{selectedContact.name}</span>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-[#ffffff11] rounded-t-[30px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-white text-xl">Loading...</span>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.user === username ? 'justify-end' : 'justify-start'} items-start gap-2.5`}>
              {message.user !== username && (
                <div className="flex items-center">
                  <img src={selectedContact.img} alt={selectedContact.name} className="w-8 h-8 rounded-full mr-2 bg-[#00000052] border-[1px] border-[#fff3]"/>
                </div>
              )}
              <div className={`flex flex-col w-full max-w-[320px] p-2 rounded-xl shadow-lg ${message.user === username ? 'bg-blue-500 text-white rounded-tr-none self-end' : 'bg-gray-300 text-gray-900 rounded-tl-none'}`}>
                {message.message && <p className="text-sm py-2.5">{message.message}</p>}
                {message.file && (
                  <img src={message.file} alt="uploaded" className="mt-2 rounded-xl max-w-full"/>
                )}
                <div className='flex justify-between text-white'>
                  <span className="text-[10px]">{message.timestamp}</span>
                  <span className="text-[10px] flex items-center gap-1">
                    {message.status || <MdDoneAll />}
                  </span>
                </div>
              </div>
              {message.user === username && (
                <div className="flex items-center self-end">
                  <img src={sender} alt="You" className="w-8 h-8 rounded-full ml-2"/>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {selectedFile && (
        <div className="p-4 border-t border-[#ffffff45] flex bg-gray-900 items-center gap-2 relative">
          <img src={selectedFile} alt="selected" className="rounded-xl max-w-full mx-auto"/>
          <button className="absolute top-4 right-4 bg-gray-700 text-white rounded-full p-1" onClick={removeSelectedFile}>
            <MdCancel size={25} />
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
          className="flex-grow p-2 bg-transparent text-white placeholder-gray-400"
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
