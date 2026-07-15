
import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token"); // or from context

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/user/getreports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data.reports || []);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ color: "#705dcd" }}>📄 Your Medical Reports</h2>

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
          {reports.map((report, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                width: "300px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <h4>👨‍⚕️ {report.doctor}</h4>
              <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}</p>
              <a
                href={`http://localhost:4000${report.pdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#705dcd",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                  marginTop: "10px"
                }}
              >
                🔽 View/Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
