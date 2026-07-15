import React, { useContext } from "react";
import { useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
export const EyeDiseaseDetector = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
 const { token, setToken} = useContext(AppContext)

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = document.getElementById('preview');
        const uploadText = document.getElementById('uploadText');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const results = document.getElementById('results');
        
        if (preview && uploadText && analyzeBtn && results) {
          preview.src = event.target.result;
          preview.classList.remove('hidden');
          uploadText.classList.add('hidden');
          analyzeBtn.classList.remove('hidden');
          results.classList.add('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await axios.post('http://localhost:5000/predict_eye_disease', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
      const data = response.data;  
      const saveResponse = await axios.post(
              'http://localhost:4000/api/user/addTest',
              {
                testType: 'Eye',
                result: {
                  prediction: data.result.prediction,
                  confidence: data.result.confidence
                },
    
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
             );

  console.log('Test result saved:', saveResponse.data);



      if (response.status !== 200) {
        throw new Error('Analysis failed. Please try again.');
      }

      // Update the UI with results
      const results = document.getElementById('results');
      const resultStatus = document.getElementById('resultStatus');
      const confidence = document.getElementById('confidence');
      
      if (results && resultStatus && confidence) {
        results.classList.remove('hidden');
        resultStatus.textContent = data.result.prediction;
        confidence.textContent = `${(data.result.confidence* 100).toFixed(2)}%`;
        
        // Update styling based on prediction
        const resultCard = document.getElementById('resultCard');
        if (data.result.prediction.toLowerCase().includes('normal')) {
          resultCard.classList.remove('border-gray-300');
          resultCard.classList.add('border-green-500');
          resultStatus.classList.add('text-green-600');
        } else {
          resultCard.classList.remove('border-gray-300');
          resultCard.classList.add('border-red-500');
          resultStatus.classList.add('text-red-600');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="webcrumbs"> 
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary-100 p-4 rounded-2xl mr-4">
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Eye Disease Detection</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your Eye scanned image and get instant AI-powered eye disease detection results with advanced medical imaging analysis.
            </p>
          </div>
      
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                Upload Image
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors duration-300 mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="imageUpload"
                  onChange={handleImageUpload}
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <div id="uploadText">
                    <p className="text-lg text-gray-600 mb-2">Click to upload eye scanned image</p>
                    <p className="text-sm text-gray-500">Supports JPG, PNG, DICOM formats</p>
                  </div>
                  <img id="preview" className="hidden max-w-full h-64 object-contain mx-auto rounded-lg shadow-md" alt="Preview" />
                </label>
              </div>
      
              <button 
                id="analyzeBtn"
                className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'} text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center`}
                onClick={analyzeImage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
      
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                Analysis Results
              </h2>
      
              <div id="results" className="hidden">
                <div id="resultCard" className="bg-gray-50 border-l-4 border-gray-300 p-6 rounded-lg">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Detection Status</h3>
                    <p id="resultStatus" className="text-lg text-gray-600">Awaiting Analysis</p>
                  </div>
                  
                  <div className="flex justify-center items-center mb-6">
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-3xl text-primary-600 mb-2">Percent</span>
                    <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
                    <p id="confidence" className="text-xl font-bold text-gray-800">--</p>
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
    </div>
  )
}