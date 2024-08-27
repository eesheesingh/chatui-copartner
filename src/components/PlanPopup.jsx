import React from 'react';
import { motion } from 'framer-motion';
import { FaRegCheckCircle, FaTimes } from 'react-icons/fa';

const PlanPopup = ({ planDetails, userId, expertId, onClose }) => {
  // Filter the plan details based on userId and expertId
  const filteredDetails = planDetails.filter(
    (detail) => detail.userId === userId && detail.expertsId === expertId
  );

  // Check if the user has used PlanType D, PlanType F, and PlanType P
  const hasUsedD = filteredDetails.some(detail => detail.planType === 'D');
  const hasUsedF = filteredDetails.some(detail => detail.planType === 'F');
  const hasUsedP = filteredDetails.some(detail => detail.planType === 'P');

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">Plan Details</h2>
        <div className="mb-4">
          <p className="flex items-center mb-2">
            <strong className="mr-2">PlanType D Used:</strong>
            {hasUsedD ? <FaRegCheckCircle className="text-green-500" /> : <FaTimes className="text-red-500" />}
          </p>
          <p className="flex items-center mb-2">
            <strong className="mr-2">PlanType F Used:</strong>
            {hasUsedF ? <FaRegCheckCircle className="text-green-500" /> : <FaTimes className="text-red-500" />}
          </p>
          <p className="flex items-center">
            <strong className="mr-2">PlanType P Used:</strong>
            {hasUsedP ? <FaRegCheckCircle className="text-green-500" /> : <FaTimes className="text-red-500" />}
          </p>
        </div>
        <ul className="list-disc pl-5 text-gray-700">
          {filteredDetails.map((detail, index) => (
            <li key={index} className="mb-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{`PlanType: ${detail.planType}`}</span>
                <span className="text-sm text-gray-500">{`(${new Date(detail.startTime).toLocaleString()} - ${new Date(detail.endTime).toLocaleString()})`}</span>
              </div>
            </li>
          ))}
        </ul>
        <button
          className="mt-6 w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default PlanPopup;
