import React from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// Set VITE_BYPASS_PAYMENT=true in frontend/.env to skip payment during testing
const BYPASS_PAYMENT = import.meta.env.VITE_BYPASS_PAYMENT === 'true';

const AIDoctorSection = () => {
  const { backendUrl, token } = useContext(AppContext);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  };

  // ── Opens the AI Doctor session directly (after auth cookie is set) ───────
  const openAISession = async () => {
    try {
      await fetch("http://localhost:5000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include"
      });
      window.open("http://localhost:5000/", "_blank");
    } catch (err) {
      console.error("Failed to open AI session:", err);
      alert("Could not connect to the AI Doctor server. Make sure it is running on port 5000.");
    }
  };

  // ── Bypass mode: skip payment, directly open session ─────────────────────
  const handleBypass = async () => {
    if (!token) {
      alert("Please login first to access the AI Doctor.");
      return;
    }
    try {
      const { data } = await axios.post(backendUrl + '/api/user/bypass-payment-ai', {}, config);
      if (data.success) {
        await openAISession();
      } else {
        alert(data.message || "Bypass failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach the backend. Make sure it is running on port 4000.");
    }
  };

  // ── Normal mode: go through Razorpay ─────────────────────────────────────
  const handleRazorpay = async () => {
    if (!token) {
      alert("Please login first to access the AI Doctor.");
      return;
    }
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpayai', {}, config);

      if (!data.success) {
        alert(data.message || "Failed to create payment order.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "AI Doctor",
        description: "Consultation Fee",
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await axios.post(
            backendUrl + "/api/user/verifyRazorpayai",
            { razorpay_order_id: response.razorpay_order_id },
            config
          );
          if (verifyRes.data.success) {
            await openAISession();
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: { name: "User", email: "user@example.com", contact: "9999999999" },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong during payment.");
    }
  };

  return (
    <section className="bg-white py-16 px-4 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        {/* Left - Image */}
        <div className="flex-1">
          <img
            src={"https://cdn-icons-png.flaticon.com/512/3774/3774299.png"}
            alt="AI Doctor"
            className="w-64 md:w-80 mx-auto"
          />
        </div>

        {/* Right - Content */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-snug">
            Get Instant AI Medical Help{!BYPASS_PAYMENT && <> for just <span className="text-indigo-600">₹99</span></>}
          </h2>
          <ul className="list-disc pl-6 text-gray-700 text-base space-y-3 mb-6">
            <li>Smart, private, and fast medical consultation</li>
            <li>Instant insights based on symptoms</li>
            <li>Available 24/7, no waiting lines</li>
            <li>Secure and confidential data handling</li>
            {!BYPASS_PAYMENT && <li>Only ₹99 for expert advice — anytime</li>}
          </ul>

          {BYPASS_PAYMENT && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
              🧪 <strong>Test Mode:</strong> Payment is bypassed. Click below to go directly to AI Doctor.
            </p>
          )}

          <button
            onClick={BYPASS_PAYMENT ? handleBypass : handleRazorpay}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white text-lg font-semibold px-6 py-3 rounded-lg shadow"
          >
            {BYPASS_PAYMENT ? '🧪 Open AI Doctor (Test Mode)' : 'Get AI Doctor Assistance'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIDoctorSection;
