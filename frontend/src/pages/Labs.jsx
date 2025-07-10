import React, { useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import UserTestResults from "../components/userTestResult";
import { FlaskConical, CheckCircle2, ShieldCheck } from "lucide-react";
import AIDoctorButton from '../components/AiDoctorButton';
import { useNavigate } from "react-router-dom";

export const Labs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div id="webcrumbs">
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Medical Testing Laboratory
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access comprehensive medical tests with advanced AI-powered diagnostics. Choose from our
              range of specialized tests below.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Previous Tests</h2>
          <UserTestResults />

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-12 mb-6 text-center">
            Take New Test
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            {/* Brain Tumor */}
            <TestCard
              title="Brain Tumor Test"
              description="Comprehensive screening for Brain Tumor detection with high-precision medical imaging analysis."
              image={assets.brain_tumor}
              onClick={() => navigate("/brain_tumor")}
            />

            {/* Kidney */}
            <TestCard
              title="Kidney Disease Test"
              description="High-precision Kidney Disease detection model for lab diagnostics and clinical decision support."
              image={assets.kidney}
              onClick={() => navigate("/kidney")}
            />

            {/* Eye */}
            <TestCard
              title="Eye Disease Test"
              description="Image-based Eye Disease detection integrated for accurate lab diagnostics"
              image={assets.eye}
              onClick={() => navigate("/eye")}
            />

            {/* Heart */}
            <TestCard
              title="Heart Disease Test"
              description="Accurate Heart Disease prediction based on medical records."
              image={assets.heart}
              onClick={() => navigate("/heart_disease")}
            />

            {/* Diabetes */}
            <TestCard
              title="Diabetes Test"
              description="Reliable Diabetes risk assessment using clinical data."
              image={assets.diabetes}
              onClick={() => navigate("/diabetic_disease")}
            />

            {/* Coming Soon */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 mx-auto">
                  <img
                    src={assets.soon}
                    alt="soon"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-3">More Tests</h3>
                <p className="text-gray-400 text-sm mb-6">Additional medical tests coming soon</p>
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-medium py-3 px-6 rounded-lg cursor-not-allowed transition-all"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FlaskConical className="text-blue-700 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Lab Services Highlights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  "AI-powered tests for Kidney, Heart, Eye, and Diabetes conditions",
                  "Get your results within minutes",
                  "Simple, secure, and privacy-friendly reports"
                ].map((text, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-700 w-5 h-5 mt-1" />
                    <p className="text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  "Heart and Diabetes checks using your medical records",
                  "Eye disease detection through advanced image analysis",
                  "Kidney health analysis with high-precision AI diagnostics"
                ].map((text, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-700 w-5 h-5 mt-1" />
                    <p className="text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <AIDoctorButton />

          <div className="text-center">
            <div className="inline-flex items-center gap-3 text-gray-700 bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              <ShieldCheck className="text-green-600 w-5 h-5" />
              <span className="font-medium">Your data is protected and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestCard = ({ title, description, image, onClick }) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 border border-gray-100">
    <div className="w-48 h-32 bg-red-100 mb-4 mx-auto overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover object-center"
      />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
      {title}
    </h3>
    <p className="text-gray-600 text-sm mb-6 text-center">
      {description}
    </p>
    <button
      onClick={onClick}
      className="w-full bg-blue-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
    >
      Take Test
    </button>
  </div>
);
