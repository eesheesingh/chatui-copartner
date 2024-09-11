import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';

const PremiumPlanPopup = ({ plans, onSelectPlan, onOpenPayment, onClose, onBackToChatList }) => {
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
    console.log('User has chosen the Premium plan:', plan);
    onSelectPlan(plan.duration, plan.id, 'P'); // Select the plan
    onOpenPayment(plan); // Trigger the payment popup
    onClose(); // Close the PremiumPlanPopup
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border border-gray-300 text-black m-3 p-6 rounded-t-lg shadow-xl z-50">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-center">Oh No! Your Time Is Up!</h2>
        <button onClick={onBackToChatList} className="text-gray-600 hover:text-gray-800 transition-colors">
          <AiOutlineClose size={24} />
        </button>
      </div>
      <p className="mt-2 text-gray-300 text-start">Select a plan to extend your time:</p>
      <ul className="mt-4 grid grid-cols-2 sm:grid-cols-2 gap-4 h-auto overflow-y-auto">
        {plans.map((plan, index) => (
          <li key={index} className="bg-white border border-gray-300 text-black rounded-lg p-4 shadow-lg transition-transform transform hover:-translate-y-1">
            <div className="text-center">
              <h3 className="text-xl font-semibold">{plan.subscriptionType}</h3>
              <h3 className="text-2xl font-bold mt-2">₹{plan.price}</h3>
              <p className="text-sm text-gray-400 mt-1">For {plan.duration} min</p>
            </div>
            <button
              className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => handlePaidPlan(plan)}
            >
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PremiumPlanPopup;
