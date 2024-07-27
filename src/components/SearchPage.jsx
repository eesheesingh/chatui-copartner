import React, { useState } from 'react';
import { IoMdSearch } from "react-icons/io";
import { back, chats } from '../assets';

const SearchPage = ({ onClose, contacts, onSelectContact }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-cover bg-center flex flex-col justify-start items-start" style={{ backgroundImage: `url(${chats})` }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center mb-8 p-2 rounded-xl border border-[#ffffff50] bg-gray-900 bg-opacity-30 backdrop-filter backdrop-blur-md shadow-lg">
          <img src={back} alt="Back" className="w-8 h-8 text-gray-400 mr-2 cursor-pointer" onClick={onClose} />
          <input
            type="text"
            placeholder="Search or start a new chat"
            className="w-full bg-transparent border-none text-gray-300 placeholder-gray-400 focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IoMdSearch className="w-6 h-6 text-gray-400 cursor-pointer" />
        </div>
        <div className="space-y-4">
          {filteredContacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center p-4 bg-gray-800 bg-opacity-70 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200"
              onClick={() => {
                onSelectContact(contact);
                onClose();
              }}
            >
              <img
                src={contact.img}
                alt={contact.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-white text-lg font-semibold">{contact.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
