import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import logo from "../assets/copartnerBlack.png";
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatApp = () => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(sessionStorage.getItem('userId') || '');
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [contacts, setContacts] = useState([]);
  const [expertId, setExpertId] = useState(sessionStorage.getItem('expertId') || null); // State to store the expertId
  const connectionRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [loading, setLoading] = useState(false);
  const [userImage, setUserImage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [showPopup, setShowPopup] = useState(false); // Popup state
  const [remainingTime, setRemainingTime] = useState(null); // State to track remaining time
  const [planType, setPlanType] = useState('D'); // State to track the current plan type
  const [planId, setPlanId] = useState(userId); // State to track the current plan ID (initially userId)

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const potentialUsername = pathSegments[2];
    const potentialUserId = pathSegments[1];
    const expertIdFromPath = pathSegments[3]; // Last parameter in the URL
  
    if (potentialUsername && /^[0-9]{10}$/.test(potentialUsername)) {
      setUsername(potentialUsername);
    } else {
      console.error('Invalid username in URL path');
      return;
    }
  
    if (potentialUserId) {
      setUserId(potentialUserId);
      setPlanId(potentialUserId); // Set the planId to userId initially
      sessionStorage.setItem('userId', potentialUserId); // Save userId to session storage
    } else {
      console.error('Invalid userId in URL path');
      return;
    }
  
    if (expertIdFromPath) {
      setExpertId(expertIdFromPath); // Store the expertId in state
      sessionStorage.setItem('expertId', expertIdFromPath); // Save expertId to session storage
    }
  
    const fetchUserImage = async () => {
      const userImg = 'https://example.com/path-to-user-image.jpg'; // Replace with actual image URL
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
                subscriptionType: expertResponse.data.data.expertTypeId, // Adjust as per your data
                planName: 'N/A', // Adjust as per your data
                expertsId: user.id,
                planType: 'D' // Add planType here
              };
            }
            return null;
          }));
          setContacts(fetchedContacts.filter(contact => contact !== null));
        }
      } catch (error) {
        console.error('Error fetching contacts: ', error);
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
            subscriptionType: expertData.expertTypeId, // Adjust as per your data
            planName: 'N/A', // Adjust as per your data
            expertsId: expertId,
            planType: 'D' // Add planType here
          };
          setSelectedContact(contact);
          startConnection(potentialUsername, contact.email, contact.planType);
        }
      } catch (error) {
        console.error('Error fetching expert data: ', error);
      }
    };
  
    fetchUserImage();
    fetchContacts().then(() => {
      if (expertIdFromPath) {
        fetchExpertAndSelect(expertIdFromPath);
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    let countdownInterval;

    if (remainingTime !== null && remainingTime > 0) {
      countdownInterval = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdownInterval);
            setShowPopup(true); // Open the popup when time is up
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [remainingTime]);

  useEffect(() => {
    if (remainingTime === 0) {
      setShowPopup(true); // Open the popup if the time is already up
    }
  }, [remainingTime]);

  const startConnection = async (username, receiver, planType) => {
    console.log('Starting connection...');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`https://copartners.in/FeaturesService/chathub?username=${encodeURIComponent(username)}&chatPartnerUsername=${encodeURIComponent(receiver)}`)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on('ReceiveMessage', (user, message, receivedPlanType, planId, startDateTime, endDateTime) => {
      if (message !== '1' && message !== '20') {
        console.log(`Received message from ${user} with startDateTime: ${startDateTime} and endDateTime: ${endDateTime}`);
        
        const newMessage = { 
          user, 
          message, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          planType: receivedPlanType,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          planId: planId,
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

        if (endDateTime) {
          const endTime = new Date(endDateTime).getTime();
          const currentTime = new Date().getTime();
          const timeRemaining = Math.floor((endTime - currentTime) / 1000);

          if (timeRemaining > 0) {
            setRemainingTime(timeRemaining);
          } else {
            setShowPopup(true); // Open the popup if the time is already up
          }
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
      toast.warn("Reconnecting...");
    });

    connection.onreconnected(() => {
      setConnectionStatus('Connected!');
      toast.success("Connected!");
    });

    connection.onclose(async () => {
      console.log("Disconnected from SignalR hub. Attempting to reconnect...");
      setConnectionStatus('Disconnected. Reconnecting...');
      toast.error("Disconnected. Reconnecting...");
      setTimeout(() => startConnection(username, receiver, planType), 5000); // Retry connection after 5 seconds
    });

    try {
      await connection.start();
      console.log('Connected to the SignalR hub!');
      setConnectionStatus('Connected!');
      connectionRef.current = connection;
      toast.success("Connected!");
    } catch (err) {
      console.error('Error starting connection: ', err.toString());
      setConnectionStatus('Connection failed.');
      toast.error("Connection failed.");
      setTimeout(() => startConnection(username, receiver, planType), 5000); // Retry connection after 5 seconds
    }
  };

  const handleSendMessage = async (message) => {
    const receiver = selectedContact.email;
  
    // Proceed with sending the message without GetChatAvailUser API
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('SendMessage', username, receiver, message.text, planType, planId);
        const newMessage = {
          user: username,
          message: message.text,
          receiver: receiver,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          planType: planType,
          planId: planId // Add planId to newMessage
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setConversations((prevConversations) => ({
          ...prevConversations,
          [receiver]: [...(prevConversations[receiver] || []), newMessage],
        }));
  
        // Retain console logging of planType and planId
        console.log(`Message sent with planType: ${planType} and planId: ${planId}`);
      } catch (err) {
        console.error('Error sending message:', err.toString());
      }
    } else {
      console.log("Cannot send data if the connection is not in the 'Connected' state.");
      setConnectionStatus('Not connected. Please try again.');
    }
  };

  const selectUser = async (contact) => {
    setMessages(conversations[contact.email] || []);
    setLoading(true);
    setExpertId(contact.expertsId); // Set the expertId when a contact is selected
    sessionStorage.setItem('expertId', contact.expertsId); // Update the expertId in session storage
  
    const storedUserId = sessionStorage.getItem('userId');
    const storedExpertId = sessionStorage.getItem('expertId');
  
    try {
      const response = await axios.get(`https://copartners.in/Featuresservice/api/ChatConfiguration/GetChatAvailUser/${storedUserId}`);
      
      if (response.data.isSuccess) {
        const userPlans = response.data.data.filter(plan => plan.userId === storedUserId && plan.expertsId === storedExpertId);
        const latestPlanD = userPlans.find(plan => plan.planType === 'D' && new Date(plan.endTime) > new Date());
        const latestPlanF = userPlans.find(plan => plan.planType === 'F' && new Date(plan.endTime) > new Date());
  
        if (latestPlanD && latestPlanF) {
          // Both PlanType "D" and "F" exist, show premium popup and don't allow messaging with PlanType "D"
          setShowPopup(true);
        } else if (latestPlanD) {
          // Only PlanType "D" exists, allow messaging with PlanType "D"
          setPlanType('D');
          setPlanId(latestPlanD.id);
        } else if (latestPlanF) {
          // Only PlanType "F" exists, show premium popup
          setShowPopup(true);
        } else {
          // No existing PlanType "D" or "F", allow messaging with default PlanType "D"
          setPlanType('D');
        }
      } else {
        // Handle error if API call was not successful
        console.error('Failed to fetch user plans');
      }
    } catch (error) {
      console.error('Error fetching user plans:', error);
    }
  
    startConnection(username, contact.email, planType); // Pass planType to startConnection
    setSelectedContact(contact);
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [contact.email]: 0
    }));
    setShowPopup(false); // Hide the popup if a new contact is selected
  };
  

  const handleBack = () => {
    setSelectedContact(null);
  };

  const handleSelectPlan = (duration, selectedPlanId, selectedPlanType) => {
    setPlanType(selectedPlanType);
    setPlanId(selectedPlanId);

    // Update the remaining time and start/end time based on the selected plan's duration
    const currentTime = new Date();
    const newEndTime = new Date(currentTime.getTime() + duration * 60000); // Add duration in minutes to the current time

    // Update remaining time
    setRemainingTime(Math.floor((newEndTime.getTime() - currentTime.getTime()) / 1000));

    setShowPopup(false); // Hide the popup
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
        />
      </div>
      <div className={`flex-col w-full bg-[#06030E] md:w-2/3 ${selectedContact ? 'flex' : 'hidden md:flex'} border-l-[1px] border-[#ffffff48]`}>
        <AnimatePresence>
          {selectedContact ? (
            <ChatArea
              key="chatArea"
              username={username}
              userImage={userImage}
              selectedContact={selectedContact}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              loading={loading}
              showPopup={showPopup}
              expertId={expertId} // Pass expertId to ChatArea
              handleSelectPlan={handleSelectPlan}
              setShowPopup={setShowPopup} // Pass setShowPopup as a prop
              connectionStatus={connectionStatus} // Pass connectionStatus as a prop
              remainingTime={remainingTime} // Pass remainingTime as a prop
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
      <ToastContainer />
    </div>
  );
};

export default ChatApp;