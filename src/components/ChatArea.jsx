import React, { useState, useEffect, useRef } from 'react';
import { IoMdAttach } from "react-icons/io";
import { MdCancel, MdDoneAll } from "react-icons/md";
import { back, loadingGif, sender } from '../assets';
import { motion } from 'framer-motion';
import { TbMessage2Share } from "react-icons/tb";
import { MdOutlineHistory } from "react-icons/md";
import FreePlanPopup from './FreePlanPopup';
import PremiumPlanPopup from './PremiumPlanPopup';

const ChatArea = ({ username, userImage, selectedContact, messages, onSendMessage, onBack, loading, expertId, connectionStatus, startEndTime, onShowPlanDetails, timer, showFreePlanPopup, showPremiumPlanPopup, freePlanDuration, premiumPlans, handleSelectPlan, closePlanPopups }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatAreaHeight, setChatAreaHeight] = useState(window.innerHeight);
  const messagesEndRef = useRef(null);
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

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

  useEffect(() => {
    const updateChatAreaHeight = () => {
      setChatAreaHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateChatAreaHeight);
    return () => window.removeEventListener('resize', updateChatAreaHeight);
  }, []);

  return (
    <motion.div
      className="flex flex-col relative" // Add relative positioning
      style={{ height: chatAreaHeight, backgroundColor: '#fff' }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 bg-white shadow-md rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <button className="md:hidden p-2 mr-4 bg-gray-100 rounded-full" onClick={onBack}>
            <img src={back} alt="Back" className="w-10" />
          </button>
          <div className="relative mr-4">
            <img
              src={selectedContact.img}
              alt={selectedContact.name}
              className="w-16 h-auto rounded-full bg-gray-200 border-2 border-gray-300"
            />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                connectionStatus === 'Connected!' ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h2>
            </div>
            {startEndTime && (
              <div className="text-sm text-gray-600">
                {`Time Span: ${startEndTime.start} - ${startEndTime.end}`}
              </div>
            )}
            {timer !== null && timer > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 mt-1"
              >
               {`You've got: ${minutes}m ${seconds.toFixed()}s`}

              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 mt-1"
              >
                Your time will start when the expert replies.
              </motion.div>
            )}
          </div>
        </div>
        <button
          className="text-[2rem] bg-[#e4e4e4] p-1 rounded-full transition-colors"
          onClick={onShowPlanDetails}
        >
          <MdOutlineHistory />
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-[#f4f4f4] rounded-t-[30px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <img src={loadingGif} alt="Loading..." className="w-20 h-20" />
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              className={`mb-4 flex ${message.user === username ? 'justify-end' : 'justify-start'} items-start gap-2.5`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }} // Delay for a staggered effect
            >
              {message.user !== username && (
                <div className="flex items-center">
                  <img src={selectedContact.img} alt={selectedContact.name} className="w-8 h-8 rounded-full mr-2 bg-gray-200 border-[1px] border-gray-300" />
                </div>
              )}
              <div className={`flex flex-col p-2 rounded-lg shadow-md ${message.user === username ? 'bg-[#a7d6f79c] text-[#000] rounded-tr-none self-end' : 'bg-gray-200 text-black rounded-tl-none'}`} style={{ maxWidth: '75%', wordWrap: 'break-word' }}>
                {message.message && <p className="text-sm py-2.5">{message.message}</p>}
                {message.file && (
                  <img src={message.file} alt="uploaded" className="mt-2 rounded-xl max-w-full" />
                )}
                <div className='flex justify-between text-black gap-2'>
                  <span className="text-[10px]">{message.timestamp}</span>
                  <span className="text-[10px] flex items-center gap-1">
                    {message.status || <MdDoneAll />}
                  </span>
                </div>
              </div>
              {message.user === username && (
                <div className="flex items-center">
                  <img src={sender} alt="You" className="w-8 h-8 rounded-full ml-2" />
                </div>
              )}
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {selectedFile && (
        <div className="p-4 border-t border-gray-300 flex bg-gray-200 items-center gap-2 relative">
          <img src={selectedFile} alt="selected" className="rounded-xl max-w-full mx-auto" />
          <button className="absolute top-4 right-4 bg-gray-500 text-white rounded-full p-1" onClick={removeSelectedFile}>
            <MdCancel size={25} />
          </button>
        </div>
      )}
      <div className="p-4 border-t border-gray-300 flex bg-[#a7d6f78a] items-center gap-2">
        <label className="ml-2 p-2 text-[22px] text-black rounded cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
        <input
          type="text"
          className="flex-grow p-2 bg-transparent text-black placeholder-gray-500"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="ml-2 p-2 bg-gradient-to-r from-[#0081F1] to-[#45C4D5] text-white rounded-full"
          onClick={sendMessage}
          disabled={!newMessage.trim() && !selectedFile}
        >
          <TbMessage2Share className='text-[22px]' />
        </button>
      </div>

      {/* Render the Plan Popups inside ChatArea */}
      {showFreePlanPopup && freePlanDuration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <FreePlanPopup 
            freePlan={{ duration: freePlanDuration, id: expertId }}
            onSelectPlan={handleSelectPlan}
            onClose={closePlanPopups} 
          />
        </div>
      )}
      {showPremiumPlanPopup && premiumPlans.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <PremiumPlanPopup 
            plans={premiumPlans} 
            onSelectPlan={handleSelectPlan}
            onClose={closePlanPopups} 
          />
        </div>
      )}
    </motion.div>
  );
};

export default ChatArea;
