import React, { useState, useEffect, useRef } from 'react';
import { IoMdAttach } from "react-icons/io";
import { MdCancel, MdDoneAll } from "react-icons/md";
import { back, loadingGif, sender } from '../assets';
import TimerPopup from './TimePopup';
import { motion } from 'framer-motion';
import { BiLogoTelegram } from 'react-icons/bi';

const ChatArea = ({ username, userImage, selectedContact, messages, onSendMessage, onBack, loading, showPopup, expertId, handleSelectPlan, setShowPopup, connectionStatus, startDateTime, endDateTime }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatAreaHeight, setChatAreaHeight] = useState(window.innerHeight);
  const [startEndTime, setStartEndTime] = useState(null); // State to store start and end time
  const [remainingTime, setRemainingTime] = useState(null); // State to store the remaining time in seconds
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

  useEffect(() => {
    const updateChatAreaHeight = () => {
      setChatAreaHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateChatAreaHeight);
    return () => window.removeEventListener('resize', updateChatAreaHeight);
  }, []);

  // Calculate and set remaining time based on startDateTime and endDateTime
  useEffect(() => {
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const now = new Date();

      const durationInSeconds = Math.floor((end - start) / 1000);
      const remainingTimeInSeconds = Math.floor((end - now) / 1000);

      setStartEndTime({
        start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      if (remainingTimeInSeconds > 0) {
        setRemainingTime(remainingTimeInSeconds);
      } else {
        setRemainingTime(0);
      }
    }
  }, [startDateTime, endDateTime]);

  // Handle the countdown timer
  useEffect(() => {
    let countdownInterval;

    if (remainingTime !== null && remainingTime > 0) {
      countdownInterval = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdownInterval);
            setShowPopup(true); // Show popup when time is up
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [remainingTime]);

  const formatRemainingTime = () => {
    if (remainingTime === 0) {
      return 'Your time is up';
    }
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `Time remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <motion.div
      className="flex flex-col"
      style={{ height: chatAreaHeight, backgroundColor: '#fff' }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 text-black flex items-center justify-between">
        <div className="flex items-center">
          <button className="md:hidden p-2 mr-4" onClick={onBack}>
            <img src={back} alt="Back" className='w-8' />
          </button>
          <img src={selectedContact.img} alt={selectedContact.name} className="w-12 h-12 rounded-full mr-4 bg-gray-200 border-[1px] border-gray-300" />
          <div className="flex flex-col">
            <div className='flex flex-row'>
              <span>{selectedContact.name}</span>
              <div className="flex items-center ml-2">
                <span className={`inline-block w-3 h-3 rounded-full ${connectionStatus === 'Connected!' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
            </div>
            {startEndTime && (
              <div className="text-sm text-gray-500">
                {`Time Span: ${startEndTime.start} - ${startEndTime.end}`}
              </div>
            )}
            {remainingTime !== null && (
              <div className="text-sm text-gray-500">
                {formatRemainingTime()}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-[#f4f4f4] rounded-t-[30px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <img src={loadingGif} alt="Loading..." className="w-20 h-20" />
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.user === username ? 'justify-end' : 'justify-start'} items-start gap-2.5`}>
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
            </div>
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
          <IoMdAttach />
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
          <BiLogoTelegram className='text-[22px]' />
        </button>
      </div>
      {showPopup && <TimerPopup onClose={() => setShowPopup(false)} expertId={expertId} onSelectPlan={handleSelectPlan} />}
    </motion.div>
  );
};

export default ChatArea;
