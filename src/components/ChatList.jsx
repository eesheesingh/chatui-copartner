import React, { useState, useEffect } from 'react';
import { logo, sebi, loadingGif, chatIcon } from '../assets';
import { IoMdSearch } from "react-icons/io";
import SearchPage from './SearchPage';
import axios from 'axios';

const ChatList = ({ contacts, onSelectContact, conversations, unreadMessages, loading }) => {
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
  const [chatListHeight, setChatListHeight] = useState(window.innerHeight);
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);

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

  useEffect(() => {
    const updateChatListHeight = () => {
      setChatListHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateChatListHeight);
    return () => window.removeEventListener('resize', updateChatListHeight);
  }, []);

  useEffect(() => {
    const fetchExperts = async () => {
      setLoadingExperts(true);
      try {
        const response = await axios.get('https://copartners.in/Featuresservice/api/ChatConfiguration?page=1&pageSize=10');
        if (response.data.isSuccess) {
          const fetchedExperts = await Promise.all(response.data.data.map(async (expert) => {
            const expertResponse = await axios.get(`https://copartners.in:5132/api/Experts/${expert.expertsId}`);
            if (expertResponse.data.isSuccess) {
              return {
                ...expert,
                ...expertResponse.data.data,
              };
            }
            return null;
          }));
          setExperts(fetchedExperts.filter(expert => expert !== null));
        }
      } catch (error) {
        console.error('Error fetching experts: ', error);
      } finally {
        setLoadingExperts(false);
      }
    };

    fetchExperts();
  }, []);

  return (
    <div className="relative min-h-screen bg-white" style={{ height: chatListHeight }}>
      {!isSearchOpen ? (
        <div className="flex flex-col h-full">
          <div className="flex flex-row justify-between items-center mb-4 px-4 py-2 mt-1">
            <img src={logo} alt="Logo" className="w-40 h-[40px]" />
            <span className='border-[1px] rounded-full p-2 border-[#00000028] bg-gray-100'>
              <IoMdSearch className="w-6 h-6 text-gray-600 cursor-pointer" onClick={handleSearchClick} />
            </span>
          </div>
          <div className='flex-grow pt-3 chat-div rounded-t-[30px] bg-[#d9d9d96c]'>
            <div className="flex justify-start gap-2 mb-4 px-4">
              <button
                className={`px-4 border py-2 rounded-[10px] ${activeTab === 'Chats' ? 'bg-[#000] text-[#fff]' : 'bg-transparent text-gray-600 border-[#000]'}`}
                onClick={() => handleTabClick('Chats')}
              >
                Chats
              </button>
              <button
                className={`px-4 border py-2 rounded-[10px] ${activeTab === 'WaitList' ? 'bg-[#000] text-[#fff]' : 'bg-transparent text-gray-600 border-[#000]'}`}
                onClick={() => handleTabClick('WaitList')}
              >
                WaitList
              </button>
              <button
                className={`px-4 border py-2 rounded-[10px] ${activeTab === 'Experts' ? 'bg-[#000] text-[#fff]' : 'bg-transparent text-gray-600 border-[#000]'}`}
                onClick={() => handleTabClick('Experts')}
              >
                Experts
              </button>
            </div>
            {activeTab === 'Chats' && (loading ? (
              <div className="flex flex-col justify-center items-center h-full">
                <img src={loadingGif} alt="Loading..." className="w-16 h-16" />
                <h1 className='text-gray-700 text-lg'>Loading...</h1>
              </div>
            ) : (
              <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-150px)] bg-transparent">
                {contacts.map((contact, index) => {
                  const lastMessage = conversations[contact.name]?.slice(-1)[0] || {};
                  const truncatedMessage = truncateMessage(lastMessage.sender === 'You' ? `You: ${lastMessage.text}` : lastMessage.text);
                  const unreadCount = unreadMessages[contact.email] || 0;
                  
                  return (
                    <div
                      key={index}
                      className={`relative flex items-center p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-200 transition duration-200`}
                      onClick={() => onSelectContact(contact)}
                    >
                      <div className='flex flex-col justify-center items-center w-[120px] pr-3'>
                        <img
                          src={contact.img}
                          alt={contact.name}
                          className="w-16 h-16 rounded-full border-[1px] border-[#00000053] bg-gray-200"
                        />
                        <p className="mt-2 text-[13px] text-gray-600">{contact.sebiRegNo}</p>
                        <img src={sebi} alt="" className='w-10' />
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-600 text-sm flex flex-row justify-between">
                          <div className='flex flex-col'>
                            <span className="text-gray-800 text-[20px] font-bold">{contact.channelName}</span>
                            <p className="font-bold">{contact.name}</p>
                            <p className="mb-1">{getExpertType(contact.subscriptionType)}</p>
                            <div className='flex gap-2'>
                              <p className="text-[17px] font-bold line-through">₹{contact.prize}/min </p><span className='text-gradient-2 font-bold text-[17px]'>FREE</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-evenly mr-2">
                            <button
                              className="hover:bg-blue-500 border-2 border-[#000] text-[#000] hover:text-white font-bold text-[17px] flex items-center transition-all py-2 px-4 rounded-lg" 
                              onClick={() => onSelectContact(contact)}
                            >
                              <img src={chatIcon} alt="" className='w-7' />
                              Chat
                            </button>
                            {unreadCount > 0 && (
                              <div className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {activeTab === 'WaitList' && (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">No contacts in WaitList</span>
                </div>
              </div>
            )}
            {activeTab === 'Experts' && (loadingExperts ? (
              <div className="flex flex-col justify-center items-center h-full">
                <img src={loadingGif} alt="Loading..." className="w-16 h-16" />
                <h1 className='text-gray-700 text-lg'>Loading...</h1>
              </div>
            ) : (
              <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-150px)] bg-white">
                {experts.map((expert, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-200 transition duration-200`}
                    onClick={() => onSelectContact(expert)}
                  >
                    <div className='flex flex-col justify-center items-center w-[120px] pr-3'>
                      <img
                        src={expert.expertImagePath}
                        alt={expert.name}
                        className="w-16 h-16 rounded-full border-[1px] border-[#000] bg-gray-200"
                      />
                      <p className="mt-2 text-[13px] text-gray-600">{expert.sebiRegNo}</p>
                      <img src={sebi} alt="" className='w-10' />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-600 text-sm flex flex-row justify-between">
                        <div className='flex flex-col'>
                          <span className="text-gray-800 text-[20px] font-bold">{expert.channelName}</span>
                          <p className="font-bold">{expert.name}</p>
                          <p className="mb-1">{getExpertType(expert.subscriptionType)}</p>
                          <div className='flex gap-2'>
                            <p className="text-[17px] font-bold line-through">₹{expert.prize}/min </p><span className='text-gradient-2 font-bold text-[17px]'>FREE</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-evenly mr-2">
                          <button
                            className="hover:bg-blue-500 border-2 border-blue-500 text-blue-500 hover:text-white font-bold text-[17px] flex items-center transition-all py-2 px-4 rounded-lg" 
                            onClick={() => onSelectContact(expert)}
                          >
                            <img src={chatIcon} alt="" className='w-7' />
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <SearchPage onClose={handleSearchClose} contacts={contacts} onSelectContact={onSelectContact} />
      )}
    </div>
  );
};

export default ChatList;
