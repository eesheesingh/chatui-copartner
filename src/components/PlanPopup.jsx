import React from 'react';
import { motion } from 'framer-motion';
import { FaRegCheckCircle, FaTimes } from 'react-icons/fa';

const PlanPopup = ({ planDetails, userId, expertId, onClose, hasUsedD }) => {
  // Filter the plan details based on userId and expertId
  const filteredDetails = planDetails.filter(
    (detail) => detail.userId === userId && detail.expertsId === expertId
  );

  const hasUsedF = filteredDetails.some(detail => detail.planType === 'F');
  const hasUsedP = filteredDetails.some(detail => detail.planType === 'P');

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Plan History</h2>
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <p className="text-xl font-semibold mr-2">PlanType D:</p>
              {hasUsedD ? (
                <FaRegCheckCircle className="text-green-500 text-2xl" />
              ) : (
                <FaTimes className="text-red-500 text-2xl" />
              )}
            </div>
            <p className="text-sm text-gray-600">{hasUsedD ? 'Used' : 'Not Used'}</p>
          </div>
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <p className="text-xl font-semibold mr-2">PlanType F:</p>
              {hasUsedF ? (
                <FaRegCheckCircle className="text-green-500 text-2xl" />
              ) : (
                <FaTimes className="text-red-500 text-2xl" />
              )}
            </div>
            <p className="text-sm text-gray-600">{hasUsedF ? 'Used' : 'Not Used'}</p>
          </div>
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <p className="text-xl font-semibold mr-2">PlanType P:</p>
              {hasUsedP ? (
                <FaRegCheckCircle className="text-green-500 text-2xl" />
              ) : (
                <FaTimes className="text-red-500 text-2xl" />
              )}
            </div>
            <p className="text-sm text-gray-600">{hasUsedP ? 'Used' : 'Not Used'}</p>
          </div>
        </div>
        <div className="border-t border-gray-300 pt-6">
          <h3 className="text-2xl font-semibold text-blue-700 mb-4">Usage History</h3>
          <ul className="space-y-4">
            {filteredDetails.map((detail, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full">
                    {detail.planType[0]}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-blue-800">{`PlanType: ${detail.planType}`}</p>
                  <p className="text-sm text-gray-600">{`${new Date(detail.startTime).toLocaleString()} - ${new Date(detail.endTime).toLocaleString()}`}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="mt-8 w-full py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default PlanPopup;
