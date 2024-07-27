// import React, { useState, useEffect, useRef } from 'react';
// import ChatList from './ChatList';
// import ChatArea from './ChatArea';
// import logo from "../assets/copartner.png";
// import * as signalR from '@microsoft/signalr';

// const contacts = [
//   { name: 'Eshee', img: 'https://i.pravatar.cc/150?img=1' },
//   { name: 'Deepak', img: 'https://i.pravatar.cc/150?img=2' },
// ];

// const ChatApp = () => {
//   const [selectedContact, setSelectedContact] = useState(null);
//   const [conversations, setConversations] = useState({
//     Eshee: [],
//     Deepak: [],
//   });
//   const [username, setUsername] = useState('');
//   const connectionRef = useRef(null);
//   const [connectionStatus, setConnectionStatus] = useState('Not connected');

//   const startConnection = async (username) => {
//     const connection = new signalR.HubConnectionBuilder()
//       .withUrl(`https://copartners.in/Featuresservice/chathub?username=${encodeURIComponent(username)}`)
//       .withAutomaticReconnect([0, 2000, 10000, 30000])
//       .configureLogging(signalR.LogLevel.Information)
//       .build();

//     connection.on('ReceiveMessage', (user, message) => {
//       setConversations((prevConversations) => ({
//         ...prevConversations,
//         [user]: [...prevConversations[user], { sender: user, text: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
//       }));
//     });

//     connection.on('LoadPreviousMessages', (messages) => {
//       messages.forEach((message) => {
//         setConversations((prevConversations) => ({
//           ...prevConversations,
//           [message.sender]: [...prevConversations[message.sender], { sender: message.sender, text: message.content, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
//         }));
//       });
//     });

//     connection.onreconnecting(() => {
//       setConnectionStatus('Reconnecting...');
//     });

//     connection.onreconnected(() => {
//       setConnectionStatus('Connected!');
//     });

//     connection.onclose(async () => {
//       setConnectionStatus('Disconnected. Attempting to reconnect...');
//       await start(connection);
//     });

//     await start(connection);
//     connectionRef.current = connection;
//   };

//   const start = async (connection) => {
//     try {
//       await connection.start();
//       setConnectionStatus('Connected!');
//       console.log('Connected to the SignalR hub!');
//     } catch (err) {
//       console.log('Error starting connection: ', err.toString());
//       setConnectionStatus('Connection failed.');
//       setTimeout(() => start(connection), 5000);
//     }
//   };

//   const handleSendMessage = async (contactName, message) => {
//     if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
//       try {
//         await connectionRef.current.invoke('SendMessage', username, contactName, message.text);
//         setConversations((prevConversations) => ({
//           ...prevConversations,
//           [contactName]: [...prevConversations[contactName], { sender: 'You', text: message.text, file: message.file, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
//         }));
//       } catch (err) {
//         console.error('Error sending message: ', err.toString());
//       }
//     } else {
//       console.log("Cannot send data if the connection is not in the 'Connected' state.");
//       setConnectionStatus('Not connected. Please try again.');
//     }
//   };

//   const selectUser = (user) => {
//     setUsername(user);
//     setSelectedContact(contacts.find(contact => contact.name === (user === 'Eshee' ? 'Deepak' : 'Eshee')));
//     startConnection(user);
//   };

//   return (
//     <div className="flex h-screen">
//       <div className={`flex-col w-full md:w-1/3 bg-[#18181B] text-white overflow-y-auto ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
//         <ChatList contacts={contacts} onSelectContact={(contact) => selectUser(contact.name)} conversations={conversations} />
//       </div>
//       <div className={`flex-col w-full bg-[#06030E] md:w-2/3 ${selectedContact ? 'flex' : 'hidden md:flex'} border-l-[1px] border-[#ffffff48]`}>
//         {selectedContact ? (
//           <ChatArea
//             contact={selectedContact}
//             conversation={conversations[selectedContact.name]}
//             onSendMessage={handleSendMessage}
//             onBack={() => setSelectedContact(null)}
//           />
//         ) : (
//           <div className="flex justify-center items-center h-full bg-[#0F0E15]"><img src={logo} alt="Logo" /></div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatApp;



import React, { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import logo from "../assets/copartner.png";
import * as signalR from '@microsoft/signalr';
import axios from 'axios';

const ChatApp = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState({});
  const [mobileNumber, setMobileNumber] = useState(localStorage.getItem('mobileNumber') || '');
  const [contacts, setContacts] = useState([]);
  const connectionRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [loading, setLoading] = useState(false);
  const [userImage, setUserImage] = useState(''); // Add state for user's image

  useEffect(() => {
    if (!mobileNumber && !localStorage.getItem('mobileNumberPrompted')) {
      const number = prompt('Please enter your mobile number:');
      if (number) {
        localStorage.setItem('mobileNumber', number);
        setMobileNumber(number);
        localStorage.setItem('mobileNumberPrompted', 'true');
      }
    }
  }, [mobileNumber]);

  useEffect(() => {
    const fetchUserImage = async () => {
      // Fetch user's image based on mobileNumber or other identifier
      // This is a placeholder, update with actual API call
      const userImg = 'https://example.com/path-to-user-image.jpg'; // Replace with actual image URL
      setUserImage(userImg);
    };

    fetchUserImage();

    const fetchContacts = async () => {
      try {
        const response = await axios.get('https://copartners.in/Featuresservice/api/ChatConfiguration?page=1&pageSize=10');
        if (response.data.isSuccess) {
          const fetchedContacts = await Promise.all(response.data.data.map(async (contact) => {
            const expertResponse = await axios.get(`https://copartners.in:5132/api/Experts/${contact.expertsId}`);
            if (expertResponse.data.isSuccess) {
              return {
                name: expertResponse.data.data.name,
                img: expertResponse.data.data.expertImagePath,
                sebiRegNo: expertResponse.data.data.sebiRegNo,
                email: expertResponse.data.data.email, // Ensure email is included
                channelName: expertResponse.data.data.channelName,
                planName: contact.planName,
                expertsId: contact.expertsId
              };
            }
            return null;
          }));
          setContacts(fetchedContacts.filter(contact => contact !== null));
        }
      } catch (error) {
        console.error('Error fetching contacts: ', error);
      }
    };

    fetchContacts();
  }, [mobileNumber]);

  const startConnection = async (mobileNumber) => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://copartners.in/FeaturesService/chathub?username=${encodeURIComponent(mobileNumber)}`)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on('ReceiveMessage', (user, message) => {
      if (message !== '1' && message !== '20') {
        const newMessage = { user, message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setConversations((prevConversations) => ({
          ...prevConversations,
          [user]: [...(prevConversations[user] || []), { sender: user, text: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
        }));
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
      setConnectionStatus('Disconnected. Attempting to reconnect...');
      await start(connection);
    });

    await start(connection);
    connectionRef.current = connection;
  };

  const start = async (connection) => {
    try {
      await connection.start();
      setConnectionStatus('Connected!');
      console.log('Connected to the SignalR hub!');
    } catch (err) {
      console.log('Error starting connection: ', err.toString());
      setConnectionStatus('Connection failed.');
      setTimeout(() => start(connection), 5000);
    }
  };

  const handleSendMessage = async (message) => {
    const receiver = selectedContact.email; // Use email of the selected contact
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        console.log('Sending message with parameters:', {
          mobileNumber,
          receiver,
          message: message.text
        });
        await connectionRef.current.invoke('SendMessage', mobileNumber, receiver, message.text);
        // Show the message instantly
        const newMessage = {
          user: mobileNumber,
          message: message.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setConversations((prevConversations) => ({
          ...prevConversations,
          [receiver]: [...(prevConversations[receiver] || []), newMessage],
        }));
      } catch (err) {
        console.error('Error sending message: ', err.toString());
      }
    } else {
      console.log("Cannot send data if the connection is not in the 'Connected' state.");
      setConnectionStatus('Not connected. Please try again.');
    }
  };

  const selectUser = (contact) => {
    setMessages(conversations[contact.email] || []);
    setLoading(true);
    startConnection(mobileNumber);
    setSelectedContact(contact);
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

  return (
    <div className="flex h-screen">
      <div className={`flex-col w-full md:w-1/3 bg-[#18181B] text-white overflow-y-auto ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        <ChatList contacts={contacts} onSelectContact={selectUser} conversations={conversations} />
      </div>
      <div className={`flex-col w-full bg-[#06030E] md:w-2/3 ${selectedContact ? 'flex' : 'hidden md:flex'} border-l-[1px] border-[#ffffff48]`}>
        {selectedContact ? (
          <ChatArea
            username={mobileNumber}
            userImage={userImage} // Pass user image
            selectedContact={selectedContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
            loading={loading}
          />
        ) : (
          <div className="flex justify-center items-center h-full bg-[#0F0E15]"><img src={logo} alt="Logo" /></div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;


