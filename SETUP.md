# MediView Setup and Testing Guide

This guide outlines exactly how to configure your environment variables, launch the 3-tier architecture, and verify that all systems are working perfectly.

---

## 1. Environment Variables Setup

You need to configure **three** `.env` files across your project.

### A. Frontend — `mediview/frontend/.env`
> Already done. Just verify it matches:
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_AI_URL=http://localhost:5000
```

---

### B. Node.js Backend — `mediview/backend/.env`
> Already exists. Fill in the values marked below:
```env
PORT=4000

# MongoDB — use local or Atlas URI
MONGODB_URI=mongodb://localhost:27017/mediview

# Cloudinary (image uploads for doctor profiles etc.)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# JWT secret — any long random string
JWT_SECRET=your_super_secret_jwt_string_here

# Admin credentials — used to log in at /admin-login
ADMIN_EMAIL=admin@mediview.com
ADMIN_PASSWORD=securepassword123

# Razorpay — for appointment payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
```

---

### C. Python AI Server — `ai-model/VideoAudio/backend/.env`
> Create this file if it does not exist:
```env
# URL of the Node.js backend (so Python can forward PDF reports)
NODE_BACKEND_URL=http://localhost:4000

# Required for the AI Doctor voice-based consultation flow
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## 2. ML Model Files — Place These Before Running AI Features

After generating your models from the Jupyter notebooks in `ai-model/Models/`, place the output files here:

```
ai-model/VideoAudio/backend/models/
├── brain_tumor.h5                       ← from BrainTumor.ipynb
├── eye.keras                            ← (eye disease model)
├── emotion_detection_Tensor_2_18.keras  ← from emotion_detection_new.ipynb
├── xgb_pipeline_kidney.pkl              ← (kidney disease pipeline)
├── heart_disease_model.sav              ← already in backend/
└── diabetes_model.sav                   ← already in backend/
```

> **Note:** The AI server already has `heart_disease_model.sav` and `diabetes_model.sav` at the `backend/` root level. These still work.

---

## 3. How to Run

### One-Command Launch (Recommended)
Open PowerShell in the **project root** (`MediView/`) and run:
```powershell
./start_servers.ps1
```
This opens **3 separate terminals**, one per server.

### Or Run Manually in 3 Terminals

| Terminal | Command |
|----------|---------|
| **Frontend** | `cd mediview/frontend` then `npm run dev` |
| **Backend** | `cd mediview/backend` then `npm run server` |
| **AI Server** | `cd ai-model/VideoAudio/backend` then `python server.py` |

### Server URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend (React) | http://localhost:5173 | 5173 |
| Backend (Node.js) | http://localhost:4000 | 4000 |
| AI Server (Python/Flask) | http://localhost:5000 | 5000 |

---

## 4. Test Cases

### ✅ Test 1 — Node.js Backend is Alive
- **URL**: `http://localhost:4000/`
- **Expected**: Page shows `"API working"`
- **Backend Terminal**: Should show `"Database Connected"` if MongoDB is running.

---

### ✅ Test 2 — Patient Portal Loads
- **URL**: `http://localhost:5173/`
- **Expected**: Home page loads with doctor listings, speciality menu, and navigation bar.
- **Verify**: Click `Doctors` and `About` — both should work.

---

### ✅ Test 3 — Admin Login Works (Unified Frontend)
- **URL**: `http://localhost:5173/admin-login`
- **Expected**: A login page appears with Admin/Doctor toggle.
- **Action**: Log in with your `.env` `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- **Expected**: Admin Dashboard appears at `/admin-dashboard` with sidebar for Appointments, Add Doctor, Doctors List.

---

### ✅ Test 4 — Doctor Login Works
- **URL**: `http://localhost:5173/admin-login`
- **Action**: Switch to Doctor mode and log in with a doctor's credentials from the database.
- **Expected**: Doctor Dashboard appears at `/doctor-dashboard` with their appointments.

---

### ✅ Test 5 — Patient Registration and Appointment Booking
1. Go to `http://localhost:5173/login` and register a new patient account.
2. Browse to `/doctors`, pick a doctor.
3. Book an appointment slot.
4. Go to `/my-appointments` — the appointment should appear.

---

### ✅ Test 6 — AI Server is Alive
- **URL**: `http://localhost:5000/`
- **Expected**: Returns `"Unauthorized"` (401) — this is correct! It means the Flask server is running and requires a token cookie to serve content.
- **AI Server Terminal**: Should show warnings for missing `.h5` models (if not generated yet) but **no crashes**.

---

### ✅ Test 7 — Brain Tumor Detection (After placing model)
1. Place `brain_tumor.h5` in `ai-model/VideoAudio/backend/models/`.
2. Restart the AI server.
3. Go to `http://localhost:5173/brain_tumor`.
4. Upload an MRI scan image.
5. **Expected**: Returns a result like `{"prediction": "notumor", "confidence": 0.97}`.

---

### ✅ Test 8 — Diabetes / Heart / Kidney Prediction
1. Go to `http://localhost:5173/diabetic_disease`.
2. Fill in the form fields and submit.
3. **Expected**: Returns a `positive` or `negative` prediction with a confidence score.
- Same for `/heart_disease` and `/kidney`.

---

### ✅ Test 9 — PDF Report Generation (End-to-End Microservice Flow)
This verifies that all 3 servers are communicating:
1. Log in as a patient and go through the AI Doctor audio interview.
2. Stop the interview.
3. **Expected chain of events:**
   - Python server processes the audio and emotion data.
   - Python server generates a PDF report.
   - Python server sends the PDF to `NODE_BACKEND_URL/api/user/addreport`.
   - Node.js stores the report.
4. Navigate to `http://localhost:5173/reports` to view the saved report.
