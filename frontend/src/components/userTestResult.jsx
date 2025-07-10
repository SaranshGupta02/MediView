import React, { useEffect, useState,useContext} from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
const UserTestResults = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token,backendUrl} = useContext(AppContext)

  const fetchTests = async () => {
    try {
      
      // console.log(token)   
      const response = await axios.get("http://localhost:4000/api/user/getTest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTests(response.data.data);
    } catch (error) {
      console.error("Error fetching test results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading test results...</p>;

  if (tests.length === 0) return <p className="text-center text-gray-500">No test results found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {[...tests]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // sort latest first
  .slice(0, 6)
  .map((test) => (

        <div
          key={test._id}
          className="bg-white rounded-xl border border-gray-200 shadow-md p-5 transition-transform hover:-translate-y-1"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">{test.testType.replace("_", " ")}</h3>
          {typeof test.result === "object" ? (
  <div className="text-sm text-gray-600 mb-2">
    <p>
      <span className="font-medium text-gray-700">Prediction:</span>{" "}
      <span className={test.result.prediction === "Positive" ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
        {test.result.prediction}
      </span>
    </p>
    <p>
      <span className="font-medium text-gray-700">Confidence:</span> {(test.result.confidence * 100).toFixed(1)}%
    </p>
  </div>
) : (
  <p className="text-sm text-gray-600 mb-2">{test.result}</p>
)}
          
          {test.imageUrl && (
            <img
              src={test.imageUrl}
              alt="Test result"
              className="w-full h-40 object-cover rounded-md mb-2"
            />
          )}
          <p className="text-xs text-gray-400">Taken on: {new Date(test.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default UserTestResults;
