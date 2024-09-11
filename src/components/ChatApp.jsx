
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import SubscriptionMinorPopup from './SubscriptionMinorPopup';

const ChatApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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
  const [currentExpertId, setCurrentExpertId] = useState(null);
  const [hasUsedPlanD, setHasUsedPlanD] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false); // Add state for the payment popup
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleOpenPaymentPopup = (plan) => {
    console.log(plan)
    setSelectedPlan(plan);
    setShowSubscriptionPopup(true); // Open the payment modal
  };

  // Close the payment popup
  const handleClosePaymentPopup = () => {
    setShowSubscriptionPopup(false);
    setSelectedPlan(null);
  };

  const closePlanPopups = () => {
    setShowFreePlanPopup(false);
    setShowPremiumPlanPopup(false);
  };

  const goBackToChatList = () => {
    closePlanPopups();
    setSelectedContact(null);

    // Remove the expertId from the URL when navigating back to ChatList
    const pathSegments = location.pathname.split('/');
    const userId = pathSegments[1];
    const username = pathSegments[2];
    const newPath = `/${userId}/${username}`;
    navigate(newPath, { replace: true });
  };

  const handleExpiredTimer = (expertId) => {
    if (expertId !== currentExpertId) return;

    console.log("Timer expired, refreshing the page...");
    setTimer(null);

    sessionStorage.removeItem(`timer_${expertId}`);
    sessionStorage.removeItem('isTimerRunning');

    window.location.reload();
  };

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const potentialUserId = pathSegments[1];
    const potentialUsername = pathSegments[2];
    const expertIdFromPath = pathSegments[3];

    if (expertIdFromPath) {
      setCurrentExpertId(expertIdFromPath);
      setExpertId(expertIdFromPath);
      sessionStorage.setItem('expertId', expertIdFromPath);
    }

    const resetTimerAndTimespan = () => {
      setTimer(null);
      setLatestTimespan(null);
    };

    resetTimerAndTimespan();

    const storedTimespan = sessionStorage.getItem(`timespan_${expertIdFromPath}`);
    const storedTimer = sessionStorage.getItem(`timer_${expertIdFromPath}`);
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
    } else {
      console.error('Invalid userId in URL path');
    }

    if (potentialUsername && /^[0-9]{10}$/.test(potentialUsername)) {
      setUsername(potentialUsername);
    } else {
      console.error('Invalid username in URL path');
    }

    const fetchUserImage = async () => {
      const userImg = 'https://example.com/path-to-user-image.jpg';
      setUserImage(userImg);
    };

    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const response = await axios.get(`https://copartners.in:5137/api/ChatConfiguration/GetChatUsersById/${potentialUserId}`);
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
        setShowFreePlanPopup(false);
        setShowPremiumPlanPopup(false);
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
      setLoading(true);
      try {
        const response = await axios.get(`https://copartners.in:5137/api/ChatConfiguration/GetChatAvailUser/${userId}`);
        if (response.data.isSuccess) {
          const plans = response.data.data.filter(plan => plan.expertsId === expertId);
          if (plans.length > 0) {
            const latestPlan = plans.reduce((latest, plan) => {
              const planEndTime = new Date(plan.endTime);
              return planEndTime > new Date(latest.endTime) ? plan : latest;
            }, plans[0]);

            const now = new Date();
            const endTime = new Date(latestPlan.endTime);
            const timeRemaining = endTime - now;

            if (timeRemaining > 0) {
              setLatestTimespan({
                start: latestPlan.startTime,
                end: latestPlan.endTime,
              });
              setTimer(timeRemaining / 1000);
              sessionStorage.setItem(`timer_${expertId}`, timeRemaining / 1000);
              sessionStorage.setItem(`timespan_${expertId}`, JSON.stringify({
                start: latestPlan.startTime,
                end: latestPlan.endTime,
              }));
            } else {
              handleExpiredTimer(expertId);
            }
          } else {
            handleExpiredTimer(expertId);
          }
        }
      } catch (error) {
        console.error('Error fetching timespan:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlans = async (userId, expertId) => {
      try {
        const chatAvailResponse = await axios.get(`https://copartners.in:5137/api/ChatConfiguration/GetChatAvailUser/${userId}`);
        if (chatAvailResponse.data.isSuccess) {
          const chatPlans = chatAvailResponse.data.data.filter(plan => plan.expertsId === expertId);
          const hasUsedD = chatPlans.some(plan => plan.planType === 'D');
          const hasUsedF = chatPlans.some(plan => plan.planType === 'F');

          const expertPlansResponse = await axios.get(`https://copartners.in:5137/api/ChatConfiguration/GetChatPlanByExpertsId/${expertId}?page=1&pageSize=10`);
          if (expertPlansResponse.data.isSuccess) {
            const expertPlans = expertPlansResponse.data.data;
            const premiumPlans = expertPlans.filter(plan => plan.planType === 'P');
            setPremiumPlans(premiumPlans);

            const freePlan = expertPlans.find(plan => plan.planType === 'F');
            if (freePlan) {
              setFreePlanDuration(freePlan.duration || 2);
              setPlanId(freePlan.id);  
            }

            const isTimerRunning = sessionStorage.getItem('isTimerRunning');
            
            // Open the popups based on conditions, but if planType "D" has been used, open the popups directly
            if (hasUsedPlanD) {
              if (freePlan && !isTimerRunning) {
                setShowFreePlanPopup(false);
                setShowPremiumPlanPopup(true);
              } else if (premiumPlans.length > 0 && !isTimerRunning) {
                setShowPremiumPlanPopup(true);
                setShowFreePlanPopup(false);
              }
            } else if (!isTimerRunning) {
              if (hasUsedD && hasUsedF && premiumPlans.length > 0) {
                setShowPremiumPlanPopup(true);
                setShowFreePlanPopup(false);
              } else if (!freePlan && hasUsedD) {
                setShowPremiumPlanPopup(true);
                setShowFreePlanPopup(false);
              } else if (hasUsedD && freePlan) {
                setShowFreePlanPopup(true);
                setShowPremiumPlanPopup(false);
              } else if (premiumPlans.length > 0) {
                setShowPremiumPlanPopup(false);
                setShowFreePlanPopup(false);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching plan data:', error);
      }
    };

    fetchUserImage();
    fetchContacts().then(() => {
      if (expertIdFromPath) {
        fetchExpertAndSelect(expertIdFromPath);
      }
    });

    // Check if user has used planType D with any expert and set `hasUsedPlanD` accordingly
    const checkPlanTypeD = async () => {
      try {
        const response = await axios.get(`https://copartners.in:5137/api/ChatConfiguration/GetChatAvailUser/${potentialUserId}`);
        if (response.data.isSuccess) {
          const hasUsedD = response.data.data.some(plan => plan.planType === 'D');
          if (hasUsedD) {
            setHasUsedPlanD(true);
          }
        }
      } catch (error) {
        console.error('Error checking PlanType D:', error);
      }
    };

    checkPlanTypeD();
  }, [location.pathname]);

  useEffect(() => {
    let intervalId;
    let startTime = Date.now();

    const checkAndRefresh = () => {
      if (timer !== null && timer > 0) {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const newTimer = timer - elapsedTime;

        if (newTimer <= 0) {
          handleExpiredTimer(currentExpertId);
        } else {
          setTimer(newTimer);
          startTime = Date.now();
        }
      }
    };

    intervalId = setInterval(checkAndRefresh, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (timer !== null && timer <= 0) {
          handleExpiredTimer(currentExpertId);
        } else {
          checkAndRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timer, currentExpertId]);

  const startConnection = async (username, receiver) => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`https://copartners.in:5137/chathub?username=${encodeURIComponent(username)}&chatPartnerUsername=${encodeURIComponent(receiver)}`)
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

        if (expertId === currentExpertId) {
          const timespan = {
            start: startDateTime,
            end: endDateTime,
          };
          sessionStorage.setItem(`timespan_${currentExpertId}`, JSON.stringify(timespan));

          const endTime = new Date(endDateTime);
          const remainingTime = endTime - new Date();
          setTimer(remainingTime > 0 ? remainingTime / 1000 : 0);
          sessionStorage.setItem(`timer_${currentExpertId}`, remainingTime > 0 ? remainingTime / 1000 : 0);

          setLatestTimespan({
            start: newMessage.startDateTime,
            end: newMessage.endDateTime,
          });

          sessionStorage.setItem(`planType_${currentExpertId}`, receivedPlanType);
          setPlanType(receivedPlanType);
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
      setConnectionStatus('Disconnected. Reconnecting...');
      setTimeout(() => startConnection(username, receiver), 5000);
    });

    try {
      await connection.start();
      setConnectionStatus('Connected!');
      connectionRef.current = connection;
    } catch (err) {
      setConnectionStatus('Connection failed.');
      setTimeout(() => startConnection(username, receiver), 5000);
    }
  };

  const fetchPlanDetails = async () => {
    try {
      const storedUserId = sessionStorage.getItem('userId');
      const response = await axios.get(`https://copartners.in:5137/api/ChatConfiguration/GetChatAvailUser/${storedUserId}`);
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

    let currentPlanId = planId || sessionStorage.getItem(`planId_${expertId}`); 
    let currentPaidPlanId = paidPlanId || sessionStorage.getItem(`paidPlanId_${expertId}`);
    const storedUserId = sessionStorage.getItem('userId'); 
    
    if (!storedUserId) {
      console.error('UserId is missing!');
      return;
    }

    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        if (planType === "D") {
          currentPlanId = storedUserId;
          currentPaidPlanId = storedUserId;
        }

        await connectionRef.current.invoke('SendMessage', username, receiver, message.text, planType, currentPlanId, currentPaidPlanId);

        const newMessage = {
          user: username,
          message: message.text,
          receiver: receiver,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          planType: planType,
          planId: currentPlanId,
          paidPlanId: currentPaidPlanId
        };
        console.log(newMessage);

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setConversations((prevConversations) => ({
          ...prevConversations,
          [receiver]: [...(prevConversations[receiver] || []), newMessage],
        }));

      } catch (err) {
        console.error('Error sending message:', err.toString());
      }
    } else {
      setConnectionStatus('Not connected. Please try again.');
    }
  };

  const handleSelectPlan = (duration, id, selectedPlanType) => {
    setPlanType(selectedPlanType);

    if (selectedPlanType === 'D') {
      const storedUserId = sessionStorage.getItem('userId');
      setPlanId(storedUserId);
      setPaidPlanId(storedUserId);
      sessionStorage.setItem(`planId_${currentExpertId}`, storedUserId);
      sessionStorage.setItem(`paidPlanId_${currentExpertId}`, storedUserId);
    } else if (selectedPlanType === 'F') {
      setPlanId(id); 
      setPaidPlanId(id);
      sessionStorage.setItem(`planId_${currentExpertId}`, id);
      sessionStorage.setItem(`paidPlanId_${currentExpertId}`, id);
    } else if (selectedPlanType === 'P') {
      setPlanId(id);
      const newPaidPlanId = uuidv4();
      setPaidPlanId(newPaidPlanId);
      sessionStorage.setItem(`planId_${currentExpertId}`, id);
      sessionStorage.setItem(`paidPlanId_${currentExpertId}`, newPaidPlanId);
    }

    sessionStorage.setItem(`planType_${currentExpertId}`, selectedPlanType);
  };

  const selectUser = async (contact) => {
    setMessages(conversations[contact.email] || []);
    setLoading(true);
    setExpertId(contact.expertsId);
    setCurrentExpertId(contact.expertsId);
    sessionStorage.setItem('expertId', contact.expertsId);

    startConnection(username, contact.email);
    setSelectedContact(contact);
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [contact.email]: 0
    }));
  };

  useEffect(() => {
    if (latestTimespan && expertId === currentExpertId) {
      sessionStorage.setItem(`latestTimespan_${expertId}`, JSON.stringify(latestTimespan));
    }

    if (timer !== null && expertId === currentExpertId) {
      sessionStorage.setItem(`timer_${expertId}`, timer);
      sessionStorage.setItem('isTimerRunning', 'true');
    } else {
      sessionStorage.removeItem('isTimerRunning');
    }
  }, [latestTimespan, timer, expertId, currentExpertId]);

  const handleBack = () => {
    goBackToChatList();
  };

  useEffect(() => {
    if (latestTimespan && timer !== null && expertId === currentExpertId) {
      const now = new Date();
      const endTime = new Date(latestTimespan.end);
      const timeRemaining = endTime - now;
      if (timeRemaining > 0) {
        setTimer(timeRemaining / 1000);
      } else {
        handleExpiredTimer(expertId);
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
          setPlanType={setPlanType}
          setLatestTimespan={setLatestTimespan}
        />
      </div>
      <div className={`flex-col w-full bg-[#06030E] md:w-2/3 ${selectedContact ? 'flex' : 'hidden md:flex'} border-l-[1px] border-[#ffffff48]`}>
        <AnimatePresence>
          {selectedContact ? (
            <ChatArea
              key={expertId} 
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
              closePlanPopups={closePlanPopups}
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
          hasUsedD={hasUsedPlanD} 
        />
      )}
      {showFreePlanPopup && freePlanDuration && (
        <FreePlanPopup 
          freePlan={{ duration: freePlanDuration, id: planId }}
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowFreePlanPopup(false)}
          onBackToChatList={goBackToChatList}

        />
      )}
      {showPremiumPlanPopup && premiumPlans.length > 0 && (
        <PremiumPlanPopup 
          plans={premiumPlans}
          onSelectPlan={handleSelectPlan}
          onOpenPayment={handleOpenPaymentPopup} // Pass the handler to open payment modal
          onClose={closePlanPopups}
          onBackToChatList={goBackToChatList}
        />
      )}
      {showSubscriptionPopup && (
        <SubscriptionMinorPopup
          selectedPlan={selectedPlan} // Pass the selected plan to the payment modal
          onClose={handleClosePaymentPopup}
          userId={userId}
          mobileNumber={username}
        />
      )}
    </div>
  );
};

export default ChatApp;
