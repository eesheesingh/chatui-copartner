import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FreePlanPopup from './FreePlanPopup';
import PremiumPlanPopup from './PremiumPlanPopup';

const TimerPopup = ({ expertId, onClose, onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [freePlan, setFreePlan] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Retrieve userId from sessionStorage
        const userId = sessionStorage.getItem('userId');
        
        if (!userId) {
          console.error('userId not found in sessionStorage');
          setShowPremiumPopup(true);
          setLoading(false);
          return;
        }

        // Fetch available plans for the expert
        const planResponse = await axios.get(`https://copartners.in:5137/api/ChatConfiguration/GetChatPlanByExpertsId/${expertId}?page=1&pageSize=10`);
        if (planResponse.data.isSuccess) {
          const availablePlans = planResponse.data.data;

          const freePlan = availablePlans.find(plan => plan.planType === 'F');
          const paidPlans = availablePlans.filter(plan => plan.planType === 'P');

          if (freePlan) {
            setFreePlan(freePlan);
            setShowPremiumPopup(false);
          } else {
            setPlans(paidPlans);
            setShowPremiumPopup(true);
          }
        } else {
          console.error('Failed to fetch expert plans');
          setShowPremiumPopup(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setShowPremiumPopup(true);
        setLoading(false);
      }
    };

    fetchPlans();
  }, [expertId]);

  if (loading) {
    return <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">Loading...</div>;
  }

  return (
    <>
      {showPremiumPopup ? (
        <PremiumPlanPopup plans={plans} onSelectPlan={onSelectPlan} onClose={onClose} />
      ) : (
        <FreePlanPopup freePlan={freePlan} onSelectPlan={onSelectPlan} onClose={onClose} />
      )}
    </>
  );
};

export default TimerPopup;
