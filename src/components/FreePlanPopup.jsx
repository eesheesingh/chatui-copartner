import React from 'react';

const FreePlanPopup = ({ freePlan, onSelectPlan, onClose }) => {
    const handleFreePlan = () => {
        console.log('User has chosen the Free plan');
        onSelectPlan(freePlan.duration, freePlan.id, 'F'); // Pass the plan id from the API response here
        onClose();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#fff] border border-[#00000030] text-[#000] m-3 p-6 rounded-t-lg shadow-xl z-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Our Expert gifts you {freePlan.duration} minutes for free!</h2>
                <button
                    className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    onClick={handleFreePlan}
                >
                    Okay
                </button>
            </div>
        </div>
    );
};

export default FreePlanPopup;
