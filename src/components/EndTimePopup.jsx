import React from 'react';
import { motion } from 'framer-motion';

const EndTimePopup = ({ onClose, onSelectOption }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Choose how you wanna die?</h2>
        <div className="flex flex-col space-y-4">
          <button
            className="bg-red-500 text-white p-2 rounded"
            onClick={() => onSelectOption('Option 1')}
          >
            Option 1
          </button>
          <button
            className="bg-red-500 text-white p-2 rounded"
            onClick={() => onSelectOption('Option 2')}
          >
            Option 2
          </button>
          <button
            className="bg-gray-500 text-white p-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EndTimePopup;
