import React, { useState, useEffect } from "react";
import { logo, sebi, loadingGif, chatIcon } from "../assets";
import { IoMdSearch } from "react-icons/io";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const ContactItem = ({
  contact,
  unreadCount,
  onSelectContact,
  getExpertType,
}) => {
  console.log(`Rendering ContactItem for: ${contact.name}, minPrice: ${contact.minPrice}`);

  return (
    <div
      className={`relative mx-3 flex flex-col items-center p-4 cursor-pointer bg-[#fff] hover:bg-gray-100 border-[#00000021] transition duration-200 mb-4 border-2 rounded-3xl`}
      onClick={() => onSelectContact(contact)}
    >
      <div className="flex flex-row justify-between items-center w-full">
        <img src={sebi} alt="" className="w-10 ml-3" />
        <p className=" text-[13px] text-gray-600">{contact.sebiRegNo}</p>
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <img
          src={contact.img}
          alt={contact.name}
          className="w-16 h-16 rounded-full border-[1px] border-[#00000053] bg-gray-200"
        />
        <div className="flex-1">
          <div className="text-gray-600 text-sm flex flex-row justify-between">
            <div className="flex flex-col">
              <span className="text-gray-800 text-[20px] font-semibold ml-3 font-poppins">
                {contact.channelName}
              </span>
              <p className="font-semibold ml-3 font-poppins text-[#24243f92]">
                {contact.name}
              </p>
              {/* Ensure minPrice is being checked correctly */}
              {/* {contact.minPrice !== null && contact.minPrice !== undefined && ( */}
                <div className="flex gap-2 ml-3">
                  {/* <p className="text-[17px] font-bold line-through">
                    ₹{contact.minPrice}/min
                  </p> */}
                  <p className="text-[17px] font-bold line-through">
                    ₹10/min
                  </p>
                  <span className="text-gradient-2 font-bold text-[17px]">
                    FREE
                  </span>
                </div>
              {/* )} */}
            </div>
            <div className="flex flex-col items-end justify-evenly">
              <button
                className="border-2 border-[#00ACFF] bg-[#00aaff19] text-[#00ACFF] hover:text-white font-semibold font-poppins text-[17px] flex items-center transition-all py-4 px-4 rounded-[1.2rem]"
                onClick={() => onSelectContact(contact)}
              >
                <img src={chatIcon} alt="" className="w-6 mr-3" />
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
    </div>
  );
};



const ChatList = ({
  contacts,
  onSelectContact,
  conversations,
  unreadMessages,
  loading,
  setPlanType,
  setLatestTimespan,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Chats");
  const [chatListHeight, setChatListHeight] = useState(window.innerHeight);
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [contactsData, setContactsData] = useState(contacts);
  const [activeChats, setActiveChats] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchTerm(""); // Clear the search term when switching tabs
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return "";
    return message.length > maxLength
      ? `${message.slice(0, maxLength)}...`
      : message;
  };

  useEffect(() => {
    const updateChatListHeight = () => {
      setChatListHeight(window.innerHeight);
    };

    window.addEventListener("resize", updateChatListHeight);
    return () => window.removeEventListener("resize", updateChatListHeight);
  }, []);

  useEffect(() => {
    const fetchExperts = async () => {
      setLoadingExperts(true);
      try {
        const response = await axios.get(
          "https://copartners.in/Featuresservice/api/ChatConfiguration?page=1&pageSize=10"
        );
        if (response.data.isSuccess) {
          const fetchedExperts = await Promise.all(
            response.data.data.map(async (expert) => {
              const expertResponse = await axios.get(
                `https://copartners.in:5132/api/Experts/${expert.expertsId}`
              );
              if (expertResponse.data.isSuccess) {
                // Fetch the plans for the current expert
                const plansResponse = await axios.get(
                  `https://copartners.in/Featuresservice/api/ChatConfiguration/GetChatPlanByExpertsId/${expert.expertsId}?page=1&pageSize=10`
                );
  
                let minPrice = null;
  
                if (plansResponse.data.isSuccess) {
                  // Filter the "P" plans and find the minimum price
                  const pPlans = plansResponse.data.data.filter(plan => plan.planType === 'P');
                  if (pPlans.length > 0) {
                    minPrice = Math.min(...pPlans.map(plan => plan.price));
                    console.log(minPrice);
                  }
                }
  
                return {
                  ...expert,
                  ...expertResponse.data.data,
                  img: expertResponse.data.data.expertImagePath, // Ensure the image path is correctly mapped
                  name: expertResponse.data.data.name, // Ensure the name is correctly mapped
                  minPrice: minPrice || null, // Store the minimum price if available
                };
              }
              return null;
            })
          );
          setExperts(fetchedExperts.filter((expert) => expert !== null));
        }
      } catch (error) {
        console.error("Error fetching experts: ", error);
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
    const pathSegments = location.pathname.split("/");
    const userId = pathSegments[1];
    const username = pathSegments[2];

    setActiveChats((prevState) => ({
      ...prevState,
      [contact.email]: true, // Mark this contact as active
    }));

    const newPath = `/${userId}/${username}/${contact.expertsId}`;
    navigate(newPath);

    sessionStorage.setItem("expertId", contact.expertsId);

    const storedPlanType = sessionStorage.getItem(
      `planType_${contact.expertsId}`
    );
    if (storedPlanType) {
      setPlanType(storedPlanType);
    } else {
      setPlanType("D");
    }

    const storedTimespan = sessionStorage.getItem(
      `timespan_${contact.expertsId}`
    );
    if (storedTimespan) {
      setLatestTimespan(JSON.parse(storedTimespan));
    } else {
      setLatestTimespan(null);
    }

    onSelectContact(contact);
  };

  const filteredContacts = contactsData.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="relative min-h-screen bg-white"
      style={{ height: chatListHeight }}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-row justify-between items-center mb-4 px-4 py-2 mt-1">
          <img src={logo} alt="Logo" className="w-40 h-[40px]" />
          <motion.div
            className="flex items-center border-[1px] rounded-full p-2 border-[#00000028] bg-gray-100"
            initial={{ width: "40px", opacity: 0 }}
            animate={
              isSearchOpen
                ? { width: "100%", opacity: 1 }
                : { width: "40px", opacity: 1 }
            }
            transition={{ type: "spring", stiffness: 300 }}
          >
            <IoMdSearch
              className="w-6 h-6 text-gray-600 cursor-pointer"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search Chats"
                className="bg-transparent text-gray-600 focus:outline-none ml-2 flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            )}
          </motion.div>
        </div>
        <div className="flex-grow pt-3 chat-div rounded-t-[30px] bg-[#d9d9d96c]">
          <div className="flex justify-start gap-2 mb-4 px-4">
            <button
              className={`px-4 py-2 ${
                activeTab === "Chats"
                  ? "text-[#000] font-semibold text-[1.5rem] font-poppins"
                  : "text-gray-600"
              }`}
              onClick={() => handleTabClick("Chats")}
            >
              Chat
            </button>

            <button
              className={`hidden px-4 border py-2 rounded-[10px] ${
                activeTab === "WaitList"
                  ? "bg-[#000] text-[#fff]"
                  : "bg-transparent text-gray-600 border-[#000]"
              }`}
              onClick={() => handleTabClick("WaitList")}
            >
              WaitList
            </button>
            <button
              className={`hidden px-4 border py-2 rounded-[10px] ${
                activeTab === "Experts"
                  ? "bg-[#000] text-[#fff]"
                  : "bg-transparent text-gray-600 border-[#000]"
              }`}
              onClick={() => handleTabClick("Experts")}
            >
              Experts
            </button>
          </div>
          {activeTab === "Chats" &&
            (loading ? (
              <div className="flex flex-col justify-center items-center h-full">
                <img src={loadingGif} alt="Loading..." className="w-16 h-16" />
                <h1 className="text-gray-700 text-lg">Loading...</h1>
              </div>
            ) : (
              <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-150px)] bg-transparent">
                {filteredContacts.map((contact, index) => {
                  const lastMessage =
                    conversations[contact.name]?.slice(-1)[0] || {};
                  const truncatedMessage = truncateMessage(
                    lastMessage.sender === "You"
                      ? `You: ${lastMessage.text}`
                      : lastMessage.text
                  );
                  const unreadCount = unreadMessages[contact.email] || 0;

                  return (
                    <ContactItem
                    key={index}
                    contact={contact}
                    unreadCount={unreadCount}
                    onSelectContact={handleContactSelect}
                    getExpertType={getExpertType}
                  />
                  );
                })}
              </div>
            ))}
          {activeTab === "WaitList" && (
            <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-150px)]">
              {experts.map((expert, index) => (
                <ContactItem
                  key={index}
                  contact={expert}
                  unreadCount={0} // Assuming no unread count for experts in the waitlist
                  onSelectContact={handleContactSelect}
                  getExpertType={getExpertType}
                />
              ))}
            </div>
          )}
          {activeTab === "Experts" && (
            <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-150px)]">
              {experts.map((expert, index) => (
                <ContactItem
                  key={index}
                  contact={expert}
                  unreadCount={0} // Assuming no unread count for experts
                  onSelectContact={handleContactSelect}
                  getExpertType={getExpertType}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
