import React, { useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const SubscriptionMinorPopup = ({
  onClose,
  selectedPlan,
  userId,
  expertName,
  chatId,
  mobileNumber,
  onBackToChatList,
  setShowSubscriptionPopup
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
    setLoading(true);
    console.log(selectedPlan);

    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false); // Re-enable the button if there's an error
      return;
    }

    // SubscriberCreateDto object using dynamic props
    const chatSubscriberCreateDto = {
      chatPlanId: selectedPlan.id, // From selectedPlan
      userId: userId, // From props
      gstAmount: selectedPlan.price * 0.18, // GST calculated from selectedPlan
      totalAmount: selectedPlan.price, // Total price from selectedPlan
      discountPercentage: selectedPlan.discountPercentage || 0, // If available, else 0
      paymentMode: "UPI", // Static for now
      transactionId: `T${Date.now()}`, // Simulated transaction ID
      transactionDate: new Date().toISOString(), // Current timestamp
      isActive: true, // Assuming it's active by default
      invoiceId :"",
      paymentId: "",
      isWebhookProcessed: false,
    };

    // Fetch to create order
    fetch(
      `https://copartners.in:5137/api/PaymentGateway/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatSubscriberCreateDto),
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error(`Network response was not ok: ${text}`);
            throw new Error(`Network response was not ok: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          alert(`Error: ${data.error}`);
          return;
        }

        // Razorpay options using dynamic props
        const options = {
          key: "rzp_live_D2N1nZHECBBkuW",
          amount: data.amountInPaise, // Amount in paise from API
          currency: "INR",
          name: expertName, // Expert name from props
          description: `Chat`, // Dynamic plan name
          order_id: data.orderId, // Razorpay order ID from API
          handler: function (response) {
            console.log("Payment response:", response);
            capturePayment(response.razorpay_payment_id, data.orderId);
            console.log(chatSubscriberCreateDto.transactionId);
            sessionStorage.setItem("transactionId", chatSubscriberCreateDto.transactionId);
          },
          prefill: {
            name: "John Doe", // You can make this dynamic if you want
            email: "john.doe@example.com", // Can be dynamic as well
            contact: mobileNumber, // Prefill mobile number dynamically
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      })
      .catch((error) => {
        console.error("Error creating order:", error);
        alert("Order creation failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const capturePayment = (paymentId, orderId) => {
    const amount = selectedPlan.price; // Dynamic total amount

    const subscriberCreateDto = {
      chatPlanId: selectedPlan.id, // Dynamic subscription ID
      userId: userId, // Dynamic user ID
      gstAmount: selectedPlan.price * 0.18, // Dynamic GST amount
      totalAmount: amount, // Dynamic total amount
      discountPercentage: selectedPlan.discountPercentage || 0, // Dynamic discount
      paymentMode: "UPI", // Static for now
      transactionId: `T${Date.now()}`, // Razorpay payment ID
      transactionDate: new Date().toISOString(), // Current timestamp
      isActive: true, // Assuming it's active by default
      invoiceId :"",
      paymentId: paymentId,
      isWebhookProcessed: false,
    };

    console.log(subscriberCreateDto);

    // Fetch to capture payment
    fetch(
      `https://copartners.in:5137/api/PaymentGateway/capture-payment?paymentId=${paymentId}&amount=${amount}&orderId=${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriberCreateDto),
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error(`Network response was not ok: ${text}`);
            throw new Error(`Network response was not ok: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          window.location.reload(); // Redirect to success page if required
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error("Error capturing payment:", error);
        alert("Payment capture failed");
      });
  };

  const handleClosePopups = () => {
    setShowSubscriptionPopup(false);
    onBackToChatList()
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white border-2 border-dashed border-black rounded-xl shadow-md md:w-[380px] w-[90%] relative">
          <div className="p-6">
            <button
              onClick={() => handleClosePopups()}
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
                <span className="text-sm text-black">
                  {selectedPlan.planName}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm text-gray-500 font-normal">
                  Amount
                </label>
                <span className="text-sm text-black">
                  ₹{selectedPlan.price}
                </span>
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
