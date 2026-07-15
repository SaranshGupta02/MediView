import React, { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const inputFields = [
  { name: "Pregnancies", type: "number" },
  { name: "Glucose", type: "number" },
  { name: "BloodPressure", type: "number" },
  { name: "SkinThickness", type: "number" },
  { name: "Insulin", type: "number" },
  { name: "BMI", type: "number" },
  { name: "DiabetesPedigreeFunction", type: "number" },
  { name: "Age", type: "number" }
];
const dropdownOptions = {};


export const DiabeticDiseaseDetector = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState(
    Object.fromEntries(inputFields.map((field) => [field.name, ""]))
  );
  const { token } = useContext(AppContext);

  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };

  const analyzeData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/predict_diabetes",
        formValues
      );

      const data = response.data;

      await axios.post(
        "http://localhost:4000/api/user/addTest",
        {
          testType: "Diabetes",
          result: {
            prediction: data.result.prediction,
            confidence: data.result.confidence,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const results = document.getElementById("results");
      const resultStatus = document.getElementById("resultStatus");
      const confidence = document.getElementById("confidence");

      if (results && resultStatus && confidence) {
        results.classList.remove("hidden");
        resultStatus.textContent = data.result.prediction;
        confidence.textContent = `${(data.result.confidence * 100).toFixed(
          2
        )}%`;

        const resultCard = document.getElementById("resultCard");
        if (data.result.prediction.toLowerCase().includes("positive")) {
          resultCard.classList.remove("border-gray-300");
          resultCard.classList.add("border-red-500");
          resultStatus.classList.add("text-red-600");
        } else {
          resultCard.classList.remove("border-gray-300");
          resultCard.classList.add("border-green-500");
          resultStatus.classList.add("text-green-600");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Diabetes Detection
          </h1>
          <p className="text-lg text-gray-600">
            Fill in medical details to predict Diabetes.
          </p>
        </div>

<div className="grid grid-cols-1 gap-8">
  {/* Input Form - wider layout */}
  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
      Enter Medical Details
    </h2>
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
      {inputFields.map((field, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.name.replace(/_/g, " ")}
          </label>
          {field.type === "dropdown" ? (
  <select
    value={formValues[field.name]}
    onChange={(e) => handleChange(field.name, e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
  >
    <option value="">Select</option>
    {(dropdownOptions[field.name] || ["yes", "no"]).map((option) => (
      <option key={option} value={option}>
        {option.charAt(0).toUpperCase() + option.slice(1)}
      </option>
    ))}
  </select>
) : (
            <input
              type="number"
              placeholder={`Enter ${field.name}`}
              value={formValues[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}
    </div>

    <button
      onClick={analyzeData}
      disabled={isLoading}
      className={`w-full ${
        isLoading ? "bg-gray-400" : "bg-primary-600 hover:bg-primary-700"
      } text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Analyzing...
        </>
      ) : (
        "Analyze Data"
      )}
    </button>
    {error && (
      <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    )}
  </div>

  {/* Result Card - appears below */}
  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
      Analysis Results
    </h2>
    <div id="results" className="hidden">
      <div
        id="resultCard"
        className="bg-gray-50 border-l-4 border-gray-300 p-6 rounded-lg"
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Detection Status
          </h3>
          <p id="resultStatus" className="text-lg text-gray-600">
            Awaiting Analysis
          </p>
        </div>
        <div className="flex justify-center items-center mb-6">
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-3xl text-primary-600 mb-2">
              Percent
            </span>
            <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
            <p id="confidence" className="text-xl font-bold text-gray-800">
              --
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl text-primary-600">Speed</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Analysis</h3>
                <p className="text-gray-600 text-sm">Get results in under 5 seconds with our optimized AI model</p>
              </div>
            </div>
      
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl text-primary-600">Verified</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">High Accuracy</h3>
                <p className="text-gray-600 text-sm">Trained on thousands of medical images for reliable detection</p>
              </div>
            </div>
      
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl text-primary-600">Security</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Private</h3>
                <p className="text-gray-600 text-sm">Your medical images are processed securely and not stored</p>
              </div>
            </div>
            </div>
      </div>
    </div>
  );
};
