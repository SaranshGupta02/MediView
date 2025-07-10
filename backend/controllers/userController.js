import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctormodel.js";
import appointmentModel from "../models/appointmentModel.js";
import TestModel from "../models/TestModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';
import reportModel from "../models/reportModel.js";

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;  // use req.user.id (from auth middleware)
        const userData = await userModel.findById(userId).select('-password');
        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;  
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" });
        }

        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: JSON.parse(address), // make sure this is JSON if sent as a string
            dob,
            gender
        });

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: "image"
            });

            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }

        res.json({ success: true, message: 'Profile Updated' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const bookAppointment = async (req, res) => {

    try {
        const userId = req.user.id; 
        const {docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const  userId  = req.user.id
        //console.log(userId)
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Check if the logged-in user owns the appointment
        if (appointmentData.userId.toString() !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        // Mark appointment as cancelled
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Release the booked slot from the doctor
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        if (!doctorData) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        const slots_booked = doctorData.slots_booked;

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
        }

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


const addTest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { testType, result } = req.body;
        
        const newTest = new TestModel({
            userId,
            testType,
            result,
            
        });

       
        if (req.body.imageUrl) {
            newTest.imageUrl = req.body.imageUrl;
        }

        await newTest.save();

        res.status(201).json({
            success: true,
            message: "Test result added successfully",
            data: newTest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllTestsForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        //console.log("request received")
        const tests = await TestModel.find({ userId }).sort({ createdAt: -1 }); //newest first
        
        res.status(200).json({
            success: true,
            message: "User test results fetched successfully",
            data: tests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const {doctor, timestamp } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const targetDir = path.join('uploads', 'reports');
    fs.mkdirSync(targetDir, { recursive: true });

    const targetPath = path.join(targetDir, `${Date.now()}-${file.originalname}`);

    // ✅ Safe cross-device copy + delete instead of rename
    fs.copyFileSync(file.path, targetPath);
    fs.unlinkSync(file.path);

    const newReport = await reportModel.create({
      user: userId,
      doctor: doctor || 'Dr. Cura',
      pdfUrl: '/' + targetPath.replace(/\\/g, '/'),
      createdAt: timestamp ? new Date(timestamp) : new Date()
    });

    return res.status(200).json({ success: true, report: newReport });
  } catch (err) {
    console.error("Error in addReport:", err);
    return res.status(500).json({ message: 'Failed to upload report' });
  }
};

const getReports = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from token by middleware

    const reports = await reportModel.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
};

const paymentRazorpayai = async (req, res) => {
  try {
    const userId = req.user.id; 
    const amount = 99; 

    const options = {
      amount: amount * 100, 
      currency: process.env.CURRENCY || "INR",
      receipt: userId,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpayai = async (req, res) => {
  try {

    const { razorpay_order_id } = req.body;
    //console.log("Razorpay Order ID:", razorpay_order_id);
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === 'paid') {
      const userId = orderInfo.receipt; // receipt was set to userId during order creation
      //console.log("Updating user payment status for userId:", userId);
      await userModel.findByIdAndUpdate(userId, { paymentDone: true });
      //console.log("Payment status updated for userId:", userId);
      return res.json({ success: true, message: "Payment Successful" });
    }

    res.json({ success: false, message: 'Payment Failed' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,verifyRazorpay,paymentRazorpay,addTest,getAllTestsForUser,addReport,getReports,paymentRazorpayai, verifyRazorpayai};