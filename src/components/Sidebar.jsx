import React from 'react';

const Sidebar = ({ onSelectUser }) => {
    const users = ['Eshee', 'Deepak'];

    return (
        <div className="w-1/4 bg-gray-200 p-4 hidden md:block">
            <h2 className="text-xl font-bold mb-4">Contacts</h2>
            <ul>
                {users.map((user) => (
                    <li
                        key={user}
                        onClick={() => onSelectUser(user)}
                        className="p-2 mb-2 bg-blue-500 text-white rounded cursor-pointer"
                    >
                        {user}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
