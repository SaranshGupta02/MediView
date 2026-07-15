import { registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,paymentRazorpay,verifyRazorpay,addTest,getAllTestsForUser,addReport,getReports,paymentRazorpayai,verifyRazorpayai} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import express from 'express'
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)

userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)

userRouter.post("/payment-razorpayai", authUser, paymentRazorpayai)
userRouter.post("/verifyRazorpayai", authUser, verifyRazorpayai)

userRouter.post("/addTest", authUser, addTest)
userRouter.get("/getTest", authUser, getAllTestsForUser)
userRouter.post('/addreport',authUser, upload.single('file'), addReport);

userRouter.get("/getreports", authUser, getReports);

export {userRouter}