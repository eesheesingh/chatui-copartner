import React from 'react';
import { motion } from 'framer-motion'; // Import framer-motion

const FreePlanPopup = ({ freePlan, onSelectPlan, onClose, onBackToChatList }) => {

    const handleCloseIconClick = () => {
        onBackToChatList(); // Trigger going back to the chat list
      };

    const handleFreePlan = () => {
        console.log('User has chosen the Free plan');
        onSelectPlan(freePlan.duration, freePlan.id, 'F'); // Pass the plan id from the API response here
        onClose();
    };

    // Framer Motion variant for entrance animation from the bottom
    const popupVariants = {
        hidden: {
            y: "100%",  // Start off the screen at the bottom
            opacity: 0, // Start invisible
        },
        visible: {
            y: 0,  // Bring it to the normal position
            opacity: 1, // Fade in
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30
            }
        },
        exit: {
            y: "100%",  // Exit down the screen
            opacity: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-t-3xl p-8 z-50"
            initial="hidden" // Starting state for the popup (off-screen)
            animate="visible" // Animate into visible state
            exit="exit" // Exit animation
            variants={popupVariants} // Connect the variants
        >
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800">🎉 Free Plan Activated!</h2>
                <p className="text-xl text-gray-600 mt-2">Enjoy {freePlan.duration} minutes of free expert advice!</p>
            </div>

            {/* Content */}
            <div className="text-center space-y-6">
                <p className="text-gray-500 text-lg">Use these minutes to ask any questions you may have.</p>
                <button
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-bold text-xl shadow-md hover:bg-gradient-to-l hover:from-purple-600 hover:to-blue-600 transition-all"
                    onClick={handleFreePlan}
                >
                    Start Free Plan
                </button>
                {/* Maybe Later Button to act as close */}
                <button
                    className="mt-4 w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={handleCloseIconClick}                >
                    Maybe Later
                </button>
            </div>
        </motion.div>
    );
};

export default FreePlanPopup;
