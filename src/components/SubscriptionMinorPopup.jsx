import React, { useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const SubscriptionMinorPopup = ({ 
  onClose, 
  selectedPlan, 
  userId, 
  expertName, 
  chatId, 
  mobileNumber 
}) => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true); // Disable the button

    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false); // Re-enable the button if there's an error
      return;
    }

    try {
      const transactionDate = new Date().toISOString();

      // Combine the subscription data into one request payload
      const subscriberCreateDto = {
        subscriptionId: selectedPlan.id,
        userId: userId,
        totalAmount: selectedPlan.price,
        paymentMode: "UPI", // Assuming UPI as the payment mode
        transactionDate,
        isActive: true,
        expertName: expertName,
        chatId: chatId,
        mobileNumber: mobileNumber
      };

      const inviteLinkCreateDto = {
        chatId: Math.floor(Math.random() * 100000000),
        durationMonths: 1, // Assuming monthly duration; adjust as needed
        isCustom: false,
        mobileNumber: mobileNumber,
        userId: userId,
      };

      const orderRequestDto = {
        subscriberCreateDto,
        inviteLinkCreateDto,
      };

      // Step 1: Create order on the backend
      const response = await fetch(
        "https://copartners.in:5009/api/PaymentGateway/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderRequestDto),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Network response was not ok: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.orderId) {
        const options = {
          key: "rzp_live_D2N1nZHECBBkuW", // Replace with your Razorpay key ID
          amount: resData.amountInPaise, // Amount in paise
          currency: "INR",
          name: "Copartner",
          description: selectedPlan.description || "Subscription Plan",
          order_id: resData.orderId, // Order ID from backend
          handler: function (response) {
            console.log("Payment response:", response);
            capturePayment(response.razorpay_payment_id, resData.orderId); // Pass orderId to capturePayment
          },
          prefill: {
            name: expertName || "User Name",
            email: "user@example.com", // Replace with actual user email
            contact: mobileNumber || "9999999999", // Replace with actual mobile number
          },
          theme: {
            color: "#3399cc",
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        console.error("Payment initiation failed:", resData);
      }
    } catch (error) {
      console.error("Error in handlePay:", error);
    } finally {
      setLoading(false); // Re-enable the button once the process is complete
    }
  };

  // Function to capture the payment
  const capturePayment = async (paymentId, orderId) => {
    const amount = selectedPlan.price;

    const subscriberCreateDto = {
      subscriptionId: selectedPlan.id,
      userId: userId,
      totalAmount: amount,
      paymentMode: "UPI",
      transactionId: paymentId,
      transactionDate: new Date().toISOString(),
      isActive: true,
    };

    const inviteLinkCreateDto = {
      chatId: Math.floor(Math.random() * 100000000),
      durationMonths: 1, // Assuming monthly duration; adjust as needed
      isCustom: false,
      mobileNumber: mobileNumber,
      userId: userId,
    };

    const orderRequestDto = {
      subscriberCreateDto,
      inviteLinkCreateDto,
    };

    try {
      setRedirecting(true);
      const response = await fetch(
        `https://copartners.in:5009/api/PaymentGateway/capture-payment?paymentId=${paymentId}&amount=${amount}&orderId=${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderRequestDto),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Network response was not ok: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Payment capture response:", data);

      if (data.success) {
        window.location.href = data.redirectUrl;
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error capturing payment:", error);
      alert("Payment capture failed");
    } finally {
      setRedirecting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white border-2 border-dashed border-black rounded-xl shadow-md md:w-[380px] w-[90%] relative">
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-8 right-4 text-gray-500 hover:text-gray-700"
            >
              <IoCloseCircleOutline className="w-6 h-6" />
            </button>

            <h2 className="md:text-2xl text-xl font-bold text-black text-left mb-4">
              Confirm Your Subscription
            </h2>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <label className="block text-sm text-gray-500 font-normal">
                  Subscription Plan
                </label>
                <span className="text-sm text-black">{selectedPlan.planName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm text-gray-500 font-normal">
                  Amount
                </label>
                <span className="text-sm text-black">₹{selectedPlan.price}</span>
              </div>
            </div>

            <button
              className={`w-full bg-gradient-to-r text-white py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition duration-300 ${
                loading
                  ? "opacity-50 from-blue-800 to-purple-800 cursor-not-allowed"
                  : "from-blue-500 to-purple-500"
              }`}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Pay"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionMinorPopup;
