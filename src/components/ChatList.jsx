import React, { useState, useEffect } from 'react';
import { logo, sebi, loadingGif, chatIcon } from '../assets';
import { IoMdSearch } from "react-icons/io";
import SearchPage from './SearchPage';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation for dynamic URL handling

const ChatList = ({ contacts, onSelectContact, conversations, unreadMessages, loading, setPlanType, setLatestTimespan }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Chats');
  const [chatListHeight, setChatListHeight] = useState(window.innerHeight);
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [contactsData, setContactsData] = useState(contacts); // Local state to manage contacts
  const [activeChats, setActiveChats] = useState({}); // State to manage the active chat state per expert

  const navigate = useNavigate(); // For navigation
  const location = useLocation(); // For dynamic URL segments

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

    const intervalId = setInterval(fetchExperts, 30000); // Fetch data every 30 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  useEffect(() => {
    setContactsData(contacts);
  }, [contacts]);

  const handleContactSelect = (contact) => {
    // Retrieve the dynamic parameters
    const pathSegments = location.pathname.split('/');
    const userId = pathSegments[1];
    const username = pathSegments[2];
  
    setActiveChats(prevState => ({
      ...prevState,
      [contact.email]: true // Mark this contact as active
    }));
  
    // Update the URL to include the dynamic userId, username, and selected expert's ID
    const newPath = `/${userId}/${username}/${contact.expertsId}`;
    navigate(newPath);
  
    // Update the sessionStorage with the new expert ID
    sessionStorage.setItem('expertId', contact.expertsId);
  
    // Retrieve the planType for the selected expert from sessionStorage
    const storedPlanType = sessionStorage.getItem(`planType_${contact.expertsId}`);
    if (storedPlanType) {
      setPlanType(storedPlanType);
    } else {
      setPlanType('D'); // Default planType if none is stored
    }
  
    // Retrieve the time span for the selected expert from sessionStorage
    const storedTimespan = sessionStorage.getItem(`timespan_${contact.expertsId}`);
    if (storedTimespan) {
      setLatestTimespan(JSON.parse(storedTimespan));
    } else {
      setLatestTimespan(null); // Clear if no time span is stored
    }
  
    onSelectContact(contact);
  };
  



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
                {contactsData.map((contact, index) => {
                  const lastMessage = conversations[contact.name]?.slice(-1)[0] || {};
                  const truncatedMessage = truncateMessage(lastMessage.sender === 'You' ? `You: ${lastMessage.text}` : lastMessage.text);
                  const unreadCount = unreadMessages[contact.email] || 0;
                  
                  return (
                    <div
                      key={index}
                      className={`relative flex items-center p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-200 transition duration-200`}
                      onClick={() => handleContactSelect(contact)}
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
                              onClick={() => handleContactSelect(contact)}
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
              <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-150px)]">
                {experts.map((expert, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (!activeChats[expert.email]) {
                        setActiveChats(prevState => ({
                          ...prevState,
                          [expert.email]: true // Mark this expert as active
                        }));
                        handleContactSelect(expert);
                      }
                    }}
                  >
                    <img
                      src={expert.img}
                      alt={expert.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{expert.name}</p>
                      <p className="text-sm text-gray-600">{getExpertType(expert.subscriptionType)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'Experts' && (
              <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-150px)]">
                {experts.map((expert, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (!activeChats[expert.email]) {
                        setActiveChats(prevState => ({
                          ...prevState,
                          [expert.email]: true // Mark this expert as active
                        }));
                        handleContactSelect(expert);
                      }
                    }}
                  >
                    <img
                      src={expert.img}
                      alt={expert.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{expert.name}</p>
                      <p className="text-sm text-gray-600">{getExpertType(expert.subscriptionType)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <SearchPage onClose={handleSearchClose} />
      )}
    </div>
  );
};

export default ChatList;
