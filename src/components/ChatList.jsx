import React, { useState } from 'react';
import { chats, logo, sebi } from '../assets';
import { IoMdSearch } from "react-icons/io";
import SearchPage from './SearchPage';
import { FaTelegramPlane } from 'react-icons/fa';

const ChatList = ({ contacts, onSelectContact, conversations }) => {
  const getExpertType = (typeId) => {
    switch (typeId) {
      case 1:
        return "Commodity";
      case 2:
        return "Equity";
      case 3:
        return "Futures & Options";
      default:
        return "Unknown";
    }
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Chats');

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return '';
    return message.length > maxLength ? `${message.slice(0, maxLength)}...` : message;
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundImage: `url(${chats})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      {!isSearchOpen ? (
        <div className="flex flex-col h-full">
          <div className="flex flex-row justify-between items-center mb-4 px-2">
            <img src={logo} alt="Logo" className="w-50 h-[60px]" />
            <span className='border-[1px] rounded-full p-2 border-[#ffffff24] bg-[#00000035]'>
              <IoMdSearch className="w-6 h-6 text-gray-400 cursor-pointer" onClick={handleSearchClick} />
            </span>
          </div>
          <div className='bg-[#ffffff11] flex-grow py-3 chat-div rounded-t-[30px]'>
            <div className="flex justify-start gap-2 mb-4 px-4">
              <button
                className={`px-4 border py-2 rounded-[10px] ${activeTab === 'Chats' ? 'bg-[#fff] text-[#000]' : 'bg-transparent text-[#fff]'}`}
                onClick={() => handleTabClick('Chats')}
              >
                Chats
              </button>
              <button
                className={`px-4 border py-2 rounded-[10px] ${activeTab === 'WaitList' ? 'bg-[#fff] text-[#000]' : 'bg-transparent text-[#fff]'}`}
                onClick={() => handleTabClick('WaitList')}
              >
                WaitList
              </button>
            </div>
            {activeTab === 'Chats' && (
              <div className="overflow-y-auto h-[calc(100vh-200px)]">
                {contacts.map((contact, index) => {
                  const lastMessage = conversations[contact.name]?.slice(-1)[0] || {};
                  const truncatedMessage = truncateMessage(lastMessage.sender === 'You' ? `You: ${lastMessage.text}` : lastMessage.text);
                  return (
                    <div
                      key={index}
                      className="flex items-center p-1 bg-transparent cursor-pointer hover:bg-[#ffffff23] border-[#ffffff1d] border-t-[1px] border-b-[1px] transition duration-200"
                      onClick={() => onSelectContact(contact)}
                    >
                    <div className='flex flex-col justify-center items-center w-[120px] pr-3'>
                      <img
                        src={contact.img}
                        alt={contact.name}
                        className="w-16 h-16 rounded-full border-[1px] border-[#ffffff3e] bg-[#7d7d7d3f]"
                        />
                        <p className="mt-2 text-[13px]">{contact.sebiRegNo}</p>
                        <p className='text-[13px]'>(SEBI)</p>
                        </div>
                        <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white text-lg font-bold text-gradient font-poppins">{contact.channelName}</span>
                          <img src={sebi} alt="" className='w-10' />
                        </div>
                        <div className="text-gray-400 text-sm flex flex-row justify-between">
                          <div className='flex flex-col'>
                            <p className="font-bold">{contact.name}</p>
                            {/* <p className="text-gray-400 text-sm">Experience: {contact.experience}yrs</p>
                            <p className="mb-1">Followers: {contact.followers}</p> */}
                            <p className="mb-1">{getExpertType(contact.expertTypeId)}</p>
                            <div className='flex gap-2'>
                            <p className="text-[17px] font-bold line-through">₹{contact.prize}/min </p><span className='text-gradient-2 font-bold text-[17px]'>FREE</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-evenly">
                            <button 
                              className="hover:bg-[#fff] bg-[#0084FF] flex items-center transition-all hover:text-[#000] text-white py-2 px-4 rounded-lg" 
                              onClick={() => onSelectContact(contact)}
                            >
                              Chat
                              <FaTelegramPlane className='ml-1' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === 'WaitList' && (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">No contacts in WaitList</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SearchPage onClose={handleSearchClose} contacts={contacts} onSelectContact={onSelectContact} />
      )}
    </div>
  );
};

export default ChatList;
