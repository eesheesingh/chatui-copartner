import React from "react";
import { subIcon } from "../assets";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { motion } from "framer-motion"; // Import framer-motion

const PremiumPlanPopup = ({
  plans,
  onSelectPlan,
  onOpenPayment,
  onClose,
  onBackToChatList,
}) => {
  const getExpertType = (typeId) => {
    switch (typeId) {
      case 1:
        return "Commodity";
      case 2:
        return "Equity";
      case 3:
        return "Futures & Options";
      default:
        return "Unknown";
    }
  };

  const handlePaidPlan = (plan) => {
    console.log("User has chosen the Premium plan:", plan);
    onSelectPlan(plan.duration, plan.id, "P"); // Select the plan
    onOpenPayment(plan); // Trigger the payment popup
    onClose(); // Close the PremiumPlanPopup
  };

  // Determine the highlighted plan index based on the number of plans
  const getHighlightedIndex = () => {
    if (plans.length === 1) {
      return 0; // Highlight the single plan
    } else if (plans.length === 2) {
      return 0; // Highlight the first plan if there are 2 plans
    } else if (plans.length >= 3) {
      return 1; // Highlight the second plan if there are 3 or more plans
    }
    return -1; // No highlighting if there are no plans
  };

  const highlightedIndex = getHighlightedIndex();

  // Framer Motion variant for entrance animation from the bottom
  const popupVariants = {
    hidden: {
      y: "100%", // Start off the screen at the bottom
      opacity: 0, // Start invisible
    },
    visible: {
      y: 0, // Bring it to the normal position
      opacity: 1, // Fade in
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      y: "100%", // Exit down the screen
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
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img src={subIcon} alt="" className="w-auto h-6" />
          <h2 className="text-[20px] font-semibold font-poppins ml-3">
            Chats Plans
          </h2>
        </div>
        <button
          onClick={onBackToChatList}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoIosCloseCircleOutline size={24} />
        </button>
      </div>

      {/* Plans List */}
      <ul className="space-y-4">
        {plans.map((plan, index) => (
          <li
            key={index}
            className={`border rounded-2xl p-4 ${
              index === highlightedIndex
                ? "border-blue-400 bg-[#0081f11b]"
                : "border-gray-300"
            } transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                {/* Display planName */}
                <h3 className="text-lg font-semibold font-poppins">
                  {plan.planName}
                </h3>
                {/* Plan details */}
                <p className="font-sans">
                  <span className="font-bold">₹{plan.price}</span> /{" "}
                  <span>{plan.duration} Mins</span>
                </p>
              </div>
              <button
                className={`px-4 py-2 w-[100px] h-[40px] rounded-lg ${
                  index === highlightedIndex
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "bg-blue-100 border-[#0181f1] border-[1px] text-blue-600"
                } font-semibold hover:opacity-90 transition-opacity`}
                onClick={() => handlePaidPlan(plan)}
              >
                BUY
              </button>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default PremiumPlanPopup;
