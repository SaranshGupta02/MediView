import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  user: { type: String, required: true },
  doctor: { type: String, default: "Dr. Cura" },
  pdfUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const reportModel = mongoose.models.Report || mongoose.model("Report", reportSchema);
export default reportModel;
