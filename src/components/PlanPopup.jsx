import React from 'react';
import { motion } from 'framer-motion';
import { IoIosCloseCircleOutline } from 'react-icons/io';

const PlanPopup = ({ planDetails, userId, expertId, onClose }) => {
  // Filter the plan details based on userId and expertId
  const filteredDetails = planDetails.filter(
    (detail) => detail.userId === userId && detail.expertsId === expertId
  );

  const getPlanLabel = (planType) => {
    switch (planType) {
      case 'D':
        return 'Your Free Time (D)';
      case 'F':
        return "Expert's Free Time (F)";
      case 'P':
        return 'Premium Plan (P)';
      default:
        return 'Unknown Plan';
    }
  };

  // Framer Motion variant for entrance animation from the bottom
  const popupVariants = {
    hidden: {
      y: '100%', // Start off-screen at the bottom
      opacity: 0, // Start invisible
    },
    visible: {
      y: 0, // Move to normal position
      opacity: 1, // Fade in
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      y: '100%', // Exit down the screen
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 text-black p-6 rounded-t-2xl shadow-xl z-50"
      initial="hidden" // Starting state for the popup (off-screen)
      animate="visible" // Animate into visible state
      exit="exit" // Exit animation
      variants={popupVariants} // Connect the variants
    >
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
        onClick={onClose}
      >
        <IoIosCloseCircleOutline size={30} />
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-6 text-left text-[#1C1B1F]">Usage History</h2>

      {/* Scrollable Usage History Section */}
      <div className="max-h-[50vh] overflow-y-auto"> {/* Limits the height to 50% of the viewport and makes it scrollable */}
        <ul className="space-y-4">
          {filteredDetails.map((detail, index) => (
            <li
              key={index}
              className="border border-gray-300 rounded-lg p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    {`Subscription Type: ${getPlanLabel(detail.planType)}`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {`Usage: ${new Date(detail.startTime).toLocaleString()} - ${new Date(detail.endTime).toLocaleString()}`}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* <button
        className="mt-8 w-full py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
        onClick={onClose}
      >
        Close
      </button> */}
    </motion.div>
  );
};

export default PlanPopup;
