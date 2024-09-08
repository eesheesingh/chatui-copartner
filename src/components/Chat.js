import React, { useState, useRef, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import 'tailwindcss/tailwind.css';

const Chat = () => {
    const [username, setUsername] = useState('');
    const [receiver, setReceiver] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Not connected');
    const connectionRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const startConnection = async (username) => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`https://copartners.in:5137/chathub?username=${encodeURIComponent(username)}`)
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on('ReceiveMessage', (user, message) => {
            addMessageToList(user, message, 'received');
        });

        connection.on('LoadPreviousMessages', (messages) => {
            messages.forEach((message) => {
                addMessageToList(message.sender, message.content, 'received');
            });
            console.log('Loaded previous messages');
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

    const addMessageToList = (user, message, type) => {
        setMessages((prevMessages) => [...prevMessages, { user, message, type }]);
        console.log('Message added to list: ' + user + ': ' + message);
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!connectionRef.current) {
            await startConnection(username);
        }

        if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke('SendMessage', username, receiver, message);
                addMessageToList(username, message, 'sent');
                console.log('Message sent: ' + message);
                setMessage('');
            } catch (err) {
                console.error('Error sending message: ', err.toString());
            }
        } else {
            console.log("Cannot send data if the connection is not in the 'Connected' state.");
            setConnectionStatus('Not connected. Please try again.');
        }
    };

    const selectUser = (user) => {
        setUsername(user);
        setReceiver(user === 'Eshee' ? 'Deepak' : 'Eshee');
        setMessages([]);
        startConnection(user);
    };

    return (
        <div className="max-w-lg mx-auto my-10 p-5 bg-white shadow-lg rounded-lg">
            <h2 className="text-center text-2xl font-bold mb-5">SignalR Chat</h2>
            <div className="mb-4 flex justify-around">
                <button onClick={() => selectUser('Eshee')} className="p-2 bg-blue-500 text-white rounded">
                    Chat as Eshee
                </button>
                <button onClick={() => selectUser('Deepak')} className="p-2 bg-blue-500 text-white rounded">
                    Chat as Deepak
                </button>
            </div>
            {username && (
                <>
                    <div className="text-center mb-4">
                        <span className={`inline-block px-3 py-1 rounded ${connectionStatus === 'Connected!' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                            {connectionStatus}
                        </span>
                    </div>
                    <div className="mb-4">
                        <div className="h-80 overflow-y-scroll bg-gray-100 p-3 rounded-lg">
                            <ul className="space-y-2">
                                {messages.map((msg, index) => (
                                    <li
                                        key={index}
                                        className={`p-2 rounded-lg ${msg.user === username ? 'bg-blue-200 self-end' : 'bg-gray-300 self-start'} max-w-xs`}
                                    >
                                        <span className="block font-bold">{msg.user}:</span> <span>{msg.message}</span>
                                    </li>
                                ))}
                                <div ref={messagesEndRef} />
                            </ul>
                        </div>
                    </div>
                    <form onSubmit={sendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Enter your message"
                            className="flex-1 p-2 border rounded"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                            Send
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default Chat;
