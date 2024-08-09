import React from 'react';

const TimerPopup = ({ onClose, plans, onSelectPlan }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 text-white m-3 p-6 rounded-t-lg shadow-xl z-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Oh No! Your Time Is Up!</h2>
        <p className="mt-2 text-gray-300">Select a plan to extend your time:</p>
      </div>
      <ul className="mt-4 grid grid-cols-2 sm:grid-cols-2 gap-4 h:auto overflow-y-auto">
        {plans.map((plan, index) => (
          <li key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-md transition-transform transform hover:-translate-y-1">
            <div className="text-center">
              <h3 className="text-xl font-semibold">{plan.subscriptionType}</h3>
              <h3 className="text-2xl font-bold mt-2">₹{plan.price}</h3>
              <p className="text-sm text-gray-400 mt-1">For {plan.duration} min</p>
            </div>
            <button
              className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => onSelectPlan(plan.duration)}
            >
              Select
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        {/* <button
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          onClick={onClose}
        >
          Close
        </button> */}
      </div>
    </div>
  );
};

export default TimerPopup;
