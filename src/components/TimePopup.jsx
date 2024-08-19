import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TimerPopup = ({ expertId, onClose, onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [freePlan, setFreePlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`https://copartners.in/Featuresservice/api/ChatConfiguration/GetChatPlanByExpertsId/${expertId}?page=1&pageSize=10`);
        if (response.data.isSuccess) {
          const fetchedPlans = response.data.data;

          const freePlan = fetchedPlans.find(plan => plan.planType === 'F');
          const paidPlans = fetchedPlans.filter(plan => plan.planType === 'P');

          if (freePlan) {
            setFreePlan(freePlan);
          }
          if (paidPlans.length > 0) {
            setPlans(paidPlans);
          }
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    fetchPlans();
  }, [expertId]);

  const handleFreePlan = () => {
    console.log('User has chosen the Free plan');
    onSelectPlan(freePlan.duration, freePlan.id, 'F'); // Pass the duration, id, and 'F' for the free plan
    onClose(); // Close the popup after selecting the free plan
  };

  const handlePaidPlan = (plan) => {
    console.log('User has chosen the Premium plan:', plan);
    onSelectPlan(plan.duration, plan.id, 'P'); // Pass the duration, id, and 'P' for the paid plan
    onClose(); // Close the popup after selecting the paid plan
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#fff] border border-[#00000030] text-[#000] m-3 p-6 rounded-t-lg shadow-xl z-50">
      {freePlan ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold">Our Expert gifts you {freePlan.duration} minutes for free!</h2>
          <button
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleFreePlan}
          >
            Okay
          </button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Oh No! Your Time Is Up!</h2>
            <p className="mt-2 text-gray-300">Select a plan to extend your time:</p>
          </div>
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-2 gap-4 h-auto overflow-y-auto">
            {plans.map((plan, index) => (
              <li key={index} className="bg-[#fff] border border-[#00000030] text-[#000] rounded-lg p-4 shadow-lg transition-transform transform hover:-translate-y-1">
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
        </>
      )}
    </div>
  );
};

export default TimerPopup;
