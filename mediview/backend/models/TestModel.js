import mongoose from "mongoose";

const TestResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to a User document
        ref: 'User',
        required: true
    },
    testType: {
        type: String,
        enum: ['Kidney', 'brain_tumor', 'Diabetes','Eye','Heart'], // Add your test types
        required: true
    },
    result: {
        type: mongoose.Schema.Types.Mixed,  // Can store string, object, etc.
        required: true
    },
    imageUrl: {
        type: String  // If the test includes uploaded images
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const TestModel = mongoose.models.TestResult || mongoose.model("TestResult", TestResultSchema);
export default TestModel;
