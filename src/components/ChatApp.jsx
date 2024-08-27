import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import PlanPopup from './PlanPopup';
import FreePlanPopup from './FreePlanPopup';
import PremiumPlanPopup from './PremiumPlanPopup';
import logo from "../assets/copartnerBlack.png";
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const ChatApp = () => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [contacts, setContacts] = useState([]);
  const [expertId, setExpertId] = useState(null);
  const connectionRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [loading, setLoading] = useState(false);
  const [userImage, setUserImage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [planDetails, setPlanDetails] = useState([]);
  const [showFreePlanPopup, setShowFreePlanPopup] = useState(false);
  const [showPremiumPlanPopup, setShowPremiumPlanPopup] = useState(false);
  const [freePlanDuration, setFreePlanDuration] = useState(null);
  const [premiumPlans, setPremiumPlans] = useState([]);
  const [planId, setPlanId] = useState('');
  const [paidPlanId, setPaidPlanId] = useState('');
  const [latestTimespan, setLatestTimespan] = useState(null);
  const [planType, setPlanType] = useState('D');
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const potentialUserId = pathSegments[1];
    const potentialUsername = pathSegments[2];
    const expertIdFromPath = pathSegments[3];

    const storedTimespan = sessionStorage.getItem('latestTimespan');
    const storedTimer = sessionStorage.getItem('timer');
    const storedPlanType = sessionStorage.getItem(`planType_${expertIdFromPath}`);
  
    if (storedTimespan) {
      setLatestTimespan(JSON.parse(storedTimespan));
    }
  
    if (storedTimer) {
      setTimer(parseInt(storedTimer, 10));
    }
  
    if (storedPlanType) {
      setPlanType(storedPlanType);
    }

    if (potentialUserId) {
      setUserId(potentialUserId);
      sessionStorage.setItem('userId', potentialUserId);
      setPlanId(potentialUserId);
      setPaidPlanId(potentialUserId);
    } else {
      console.error('Invalid userId in URL path');
      return;
    }

    if (potentialUsername && /^[0-9]{10}$/.test(potentialUsername)) {
      setUsername(potentialUsername);
    } else {
      console.error('Invalid username in URL path');
      return;
    }

    if (expertIdFromPath) {
      setExpertId(expertIdFromPath);
      sessionStorage.setItem('expertId', expertIdFromPath);
    } else {
      console.error('Invalid expertId in URL path');
      return;
    }

    const fetchUserImage = async () => {
      const userImg = 'https://example.com/path-to-user-image.jpg'; // Replace with the actual image URL
      setUserImage(userImg);
    };

    

    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const response = await axios.get(`https://copartners.in/Featuresservice/api/ChatConfiguration/GetChatUsersById/${potentialUserId}`);
        if (response.data.isSuccess) {
          const filteredUsers = response.data.data.filter(user => user.userType === 'RA');
          const fetchedContacts = await Promise.all(filteredUsers.map(async (user) => {
            const expertResponse = await axios.get(`https://copartners.in:5132/api/Experts/${user.id}`);
            if (expertResponse.data.isSuccess) {
              return {
                name: expertResponse.data.data.name,
                img: expertResponse.data.data.expertImagePath,
                sebiRegNo: expertResponse.data.data.sebiRegNo,
                email: user.username,
                channelName: expertResponse.data.data.channelName,
                subscriptionType: expertResponse.data.data.expertTypeId,
                planName: 'N/A',
                expertsId: user.id
              };
            }
            return null;
          }));
          setContacts(fetchedContacts.filter(contact => contact !== null));
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoadingContacts(false);
      }
    };

    const fetchExpertAndSelect = async (expertId) => {
      try {
        const expertResponse = await axios.get(`https://copartners.in:5132/api/Experts/${expertId}`);
        if (expertResponse.data.isSuccess) {
          const expertData = expertResponse.data.data;
          const contact = {
            name: expertData.name,
            img: expertData.expertImagePath,
            sebiRegNo: expertData.sebiRegNo,
            email: expertData.email,
            channelName: expertData.channelName,
            subscriptionType: expertData.expertTypeId,
            planName: 'N/A',
            expertsId: expertId
          };
          setSelectedContact(contact);
          startConnection(potentialUsername, contact.email);
          fetchTimespan(potentialUserId, expertId);
          fetchPlans(potentialUserId, expertId);
        }
      } catch (error) {
        console.error('Error fetching expert data:', error);
      }
    };

    const fetchTimespan = async (userId, expertId) => {
      try {
         const response = await axios.get(`https://copartners.in/Featuresservice/api/ChatConfiguration/GetChatAvailUser/${userId}`);
         if (response.data.isSuccess) {
            const plans = response.data.data;
            const latestPlan = plans.reduce((latest, plan) => {
               const planEndTime = new Date(plan.endTime);
               return planEndTime > new Date(latest.endTime) ? plan : latest;
            }, plans[0]);
   
            console.log("Latest Plan:", latestPlan); // <-- Log the latest plan
   
            const isD = plans.some(plan => plan.planType === 'D');
            const isF = plans.some(plan => plan.planType === 'F');
            const isP = plans.some(plan => plan.planType === 'P');
            
            console.log("Conditions: ", { isD, isF, isP });  // <-- Log the condition checks
   
            const now = new Date();
            const endTime = new Date(latestPlan.endTime);
            if (now >= endTime) {
               if (isD && !isF && !isP) {
                  console.log("Showing FreePlanPopup");  // <-- Confirming the Popup trigger
                  setShowFreePlanPopup(true);
                  setShowPremiumPlanPopup(false);
               } else if (isD && (isF || isP)) {
                  console.log("Showing PremiumPlanPopup");  // <-- Confirming the Popup trigger
                  setShowPremiumPlanPopup(true);
                  setShowFreePlanPopup(false);
               } else if (isD && !isF && isP){
                console.log("Show Prem Popup plan");
                setShowPremiumPlanPopup(true);
                setShowFreePlanPopup(false)
               }
               else {
                  setShowFreePlanPopup(false);
                  setShowPremiumPlanPopup(false);
               }
            }
   
            const timeRemaining = endTime - now;
            setTimer(timeRemaining > 0 ? timeRemaining / 1000 : 0);
         } else {
            setShowFreePlanPopup(false);
            setShowPremiumPlanPopup(false);
         }
      } catch (error) {
         console.error('Error fetching timespan:', error);
      }
   };
   
   
   const fetchPlans = async (userId, expertId) => {
    try {
        const response = await axios.get(`https://copartners.in/Featuresservice/api/ChatConfiguration/GetChatPlanByExpertsId/${expertId}?page=1&pageSize=10`);
        if (response.data.isSuccess) {
            const freePlan = response.data.data.find(plan => plan.planType === 'F');
            const premiumPlans = response.data.data.filter(plan => plan.planType === 'P');
            
            if (freePlan) {
                setFreePlanDuration(freePlan.duration);
                if (planType !== 'D') {
                    setPlanId(freePlan.id);  // Set the planId to the id of the free plan only if not 'D'
                }
            }
            
            if (premiumPlans.length > 0) {
                setPremiumPlans(premiumPlans);
            }
        }
    } catch (error) {
        console.error('Error fetching plans:', error);
    }
};


    fetchUserImage();
    fetchContacts().then(() => {
      if (expertIdFromPath) {
        fetchExpertAndSelect(expertIdFromPath);
      }
    });

  }, [location.pathname, planType]);

  useEffect(() => {
    if (timer !== null && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer - 1;
          if (newTimer <= 0) {
            clearInterval(intervalId);
            // Perform any action just before refreshing
            console.log("Timer ended. Refreshing the page...");
            window.location.reload(); // Refresh the page
            return 0;
          }
          return newTimer;
        });
      }, 1000);
  
      return () => clearInterval(intervalId);
    }
  }, [timer]);
  

  const startConnection = async (username, receiver) => {
    console.log('Starting connection...');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`https://copartners.in/FeaturesService/chathub?username=${encodeURIComponent(username)}&chatPartnerUsername=${encodeURIComponent(receiver)}`)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

      connection.on('ReceiveMessage', (user, message, receivedPlanType, planId, paidPlanId, startDateTime, endDateTime) => {
        if (message !== '1' && message !== '20') {
          const newMessage = {
            user,
            message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            planType: receivedPlanType,
            planId: planId,
            paidPlanId: paidPlanId,
            startDateTime: new Date(startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endDateTime: new Date(endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
      
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          setConversations((prevConversations) => ({
            ...prevConversations,
            [user]: [...(prevConversations[user] || []), { sender: user, text: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
          }));
      
          setUnreadMessages((prevUnread) => ({
            ...prevUnread,
            [user]: (prevUnread[user] || 0) + 1
          }));
      
          const currentExpertId = sessionStorage.getItem('expertId');
          if (currentExpertId) {
            const timespan = {
              start: startDateTime,
              end: endDateTime,
            };
            sessionStorage.setItem(`timespan_${currentExpertId}`, JSON.stringify(timespan));
      
            // Calculate and store the timer for the current expert
            const endTime = new Date(endDateTime);
            const remainingTime = endTime - new Date();
            setTimer(remainingTime > 0 ? remainingTime / 1000 : 0);
            sessionStorage.setItem(`timer_${currentExpertId}`, remainingTime > 0 ? remainingTime / 1000 : 0);
      
            setLatestTimespan({
              start: newMessage.startDateTime,
              end: newMessage.endDateTime,
            });
          }
        }
      });
      

    connection.on('LoadPreviousMessages', (messages) => {
      const filteredMessages = messages.filter(msg => msg.content !== '1' && msg.content !== '20');
      const formattedMessages = filteredMessages.map(message => ({
        user: message.sender,
        message: message.content,
        timestamp: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setMessages(formattedMessages);
      setConversations((prevConversations) => {
        const updatedConversations = { ...prevConversations };
        formattedMessages.forEach(msg => {
          if (!updatedConversations[msg.user]) {
            updatedConversations[msg.user] = [];
          }
          updatedConversations[msg.user].push({ sender: msg.user, text: msg.message, timestamp: msg.timestamp });
        });
        return updatedConversations;
      });
      setLoading(false);
    });

    connection.onreconnecting(() => {
      setConnectionStatus('Reconnecting...');
    });

    connection.onreconnected(() => {
      setConnectionStatus('Connected!');
    });

    connection.onclose(async () => {
      console.log("Disconnected from SignalR hub. Attempting to reconnect...");
      setConnectionStatus('Disconnected. Reconnecting...');
      setTimeout(() => startConnection(username, receiver), 5000); // Retry connection after 5 seconds
    });

    try {
      await connection.start();
      console.log('Connected to the SignalR hub!');
      setConnectionStatus('Connected!');
      connectionRef.current = connection;
    } catch (err) {
      console.error('Error starting connection: ', err.toString());
      setConnectionStatus('Connection failed.');
      setTimeout(() => startConnection(username, receiver), 5000); // Retry connection after 5 seconds
    }
  };

  const fetchPlanDetails = async () => {
    try {
      const storedUserId = sessionStorage.getItem('userId');
      const response = await axios.get(`https://copartners.in/Featuresservice/api/ChatConfiguration/GetChatAvailUser/${storedUserId}`);
      if (response.data.isSuccess) {
        setPlanDetails(response.data.data);
        setShowPlanPopup(true);
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const handleSendMessage = async (message) => {
    const receiver = selectedContact.email;

    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('SendMessage', username, receiver, message.text, planType, planId, paidPlanId);
        const newMessage = {
          user: username,
          message: message.text,
          receiver: receiver,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          planType: planType,
          planId: planId,
          paidPlanId: paidPlanId
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setConversations((prevConversations) => ({
          ...prevConversations,
          [receiver]: [...(prevConversations[receiver] || []), newMessage],
        }));

        console.log(`Message sent with planType: ${planType}, planId: ${planId}, paidPlanId: ${paidPlanId}`);
      } catch (err) {
        console.error('Error sending message:', err.toString());
      }
    } else {
      console.log("Cannot send data if the connection is not in the 'Connected' state.");
      setConnectionStatus('Not connected. Please try again.');
    }
  };

  const handleSelectPlan = (duration, id, selectedPlanType) => {
    setPlanType(selectedPlanType);
  
    if (selectedPlanType === 'D') {
      const storedUserId = sessionStorage.getItem('userId');
      setPlanId(storedUserId);  // Use the userId stored in sessionStorage
      setPaidPlanId(storedUserId);
    } else if (selectedPlanType === 'F') {
      setPlanId(id);  // Use the ID passed to this function, which is the free plan's ID
      setPaidPlanId(id);
    } else if (selectedPlanType === 'P') {
      setPlanId(id);
      setPaidPlanId(uuidv4());
      if (!showPremiumPlanPopup) {
        setShowPremiumPlanPopup(true);
      }
    }
  
    // Save the planType for the current expert in sessionStorage
    const currentExpertId = sessionStorage.getItem('expertId');
    if (currentExpertId) {
      sessionStorage.setItem(`planType_${currentExpertId}`, selectedPlanType);
    }
  
    console.log(`Selected plan with type ${selectedPlanType} and ID ${id}`);
  };
  


  const selectUser = async (contact) => {
    setMessages(conversations[contact.email] || []);
    setLoading(true);
    setExpertId(contact.expertsId);
    sessionStorage.setItem('expertId', contact.expertsId);

    startConnection(username, contact.email);
    setSelectedContact(contact);
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [contact.email]: 0
    }));
  };

  useEffect(() => {
    if (latestTimespan) {
      // Persist the latest timespan in sessionStorage
      sessionStorage.setItem('latestTimespan', JSON.stringify(latestTimespan));
    }
  
    if (timer !== null) {
      // Persist the timer in sessionStorage
      sessionStorage.setItem('timer', timer);
    }
  }, [latestTimespan, timer]);
  

  const handleBack = () => {
    setSelectedContact(null);
  };

  useEffect(() => {
    if (latestTimespan && timer !== null) {
      const now = new Date();
      const endTime = new Date(latestTimespan.end);
      const timeRemaining = endTime - now;
      if (timeRemaining > 0) {
        setTimer(timeRemaining / 1000);
      } else {
        setTimer(0);
        if (showFreePlanPopup) {
          setShowFreePlanPopup(false);
          setShowPremiumPlanPopup(true);
        }
      }
    }
  }, [selectedContact]);

  const onShowPlanDetails = () => {
    fetchPlanDetails();
  };

  return (
    <div className="flex h-screen">
      <div className={`flex-col w-full md:w-1/3 bg-[#18181B] text-white overflow-y-auto ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
      <ChatList 
        contacts={contacts} 
        onSelectContact={selectUser} 
        conversations={conversations} 
        unreadMessages={unreadMessages} 
        loading={loadingContacts}
        setPlanType={setPlanType} // Pass setPlanType as a prop to ChatList
        setLatestTimespan={setLatestTimespan} // Pass setLatestTimespan as a prop to ChatList
      />
      </div>
      <div className={`flex-col w-full bg-[#06030E] md:w-2/3 ${selectedContact ? 'flex' : 'hidden md:flex'} border-l-[1px] border-[#ffffff48]`}>
        <AnimatePresence>
          {selectedContact ? (
            <ChatArea
              username={username}
              userImage={userImage}
              selectedContact={selectedContact}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              loading={loading}
              expertId={expertId}
              connectionStatus={connectionStatus}
              startEndTime={latestTimespan}
              onShowPlanDetails={onShowPlanDetails}
              timer={timer}
              showFreePlanPopup={showFreePlanPopup}
              showPremiumPlanPopup={showPremiumPlanPopup}
              freePlanDuration={freePlanDuration}
              premiumPlans={premiumPlans}
              handleSelectPlan={handleSelectPlan}
              closePlanPopups={() => {
                setShowFreePlanPopup(false);
                setShowPremiumPlanPopup(false);
              }}
            />

          ) : (
            <motion.div
              key="logo"
              className="flex justify-center items-center h-full bg-[#f0f0f0]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <img src={logo} alt="Logo" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showPlanPopup && (
        <PlanPopup 
          planDetails={planDetails} 
          userId={userId} 
          expertId={expertId} 
          onClose={() => setShowPlanPopup(false)} 
        />
      )}
      {showFreePlanPopup && freePlanDuration && (
        <FreePlanPopup 
          freePlan={{ duration: freePlanDuration, id: planId }}
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowFreePlanPopup(false)} 
        />
      )}
      {showPremiumPlanPopup && premiumPlans.length > 0 && (
        <PremiumPlanPopup 
          plans={premiumPlans} 
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowPremiumPlanPopup(false)} 
        />
      )}
    </div>
  );
};

export default ChatApp;
