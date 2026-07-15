# MediView

MediView is a full-stack healthcare platform with three parts:

- a patient-facing frontend for browsing doctors, booking appointments, managing profiles, viewing reports, and using lab/AI health tools
- an admin dashboard for managing doctors and appointments
- a Node.js/Express backend that powers authentication, appointments, reports, payments, file uploads, and database access

## Project Structure

- `frontend/` - patient portal built with React + Vite
- `admin/` - admin and doctor dashboard built with React + Vite
- `backend/` - Express API with MongoDB, Cloudinary, and Razorpay integrations

## Main Features

### Patient Frontend

- browse doctors by speciality
- book and cancel appointments
- view upcoming appointments and personal profile data
- upload and manage medical reports
- access lab tools and AI disease pages for:
  - brain tumor
  - kidney disease
  - eye disease
  - heart disease
  - diabetes

### Admin Dashboard

- admin login
- add doctors
- view all doctors
- view and manage appointments
- change doctor availability
- access doctor-specific dashboard and profile pages

### Backend API

- user registration and login
- admin and doctor authentication
- doctor listing and appointment management
- profile updates and report uploads
- Razorpay payment and verification flows
- MongoDB persistence and Cloudinary file storage

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Express 5
- MongoDB + Mongoose
- Cloudinary
- Razorpay
- Axios
- React Toastify

## Requirements

- Node.js 18 or newer
- npm
- MongoDB database
- Cloudinary account
- Razorpay account and API keys

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Admin (`admin/.env`)

```env
VITE_BACKEND_URL=http://localhost:4000
```

## Installation

Install dependencies in each app separately:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install
```

## Running Locally

Start the backend first, then run the frontend apps in separate terminals.

### Backend

```bash
cd backend
npm run server
```

### Patient Frontend

```bash
cd frontend
npm run dev
```

### Admin Dashboard

```bash
cd admin
npm run dev
```

## Notes

- The repository is split into three independent apps, so each folder has its own `package.json` and install step.
- Some parts of the project history live on a different branch. The active workspace is `main`, while `master` contains an earlier clean baseline commit. If a file or feature seems missing here, check the other branch before assuming it was removed.
- The backend currently exposes API routes under `/api/user`, `/api/admin`, and `/api/doctor`.

## API Overview

### User Routes

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/get-profile`
- `POST /api/user/update-profile`
- `POST /api/user/book-appointment`
- `GET /api/user/appointments`
- `POST /api/user/cancel-appointment`
- `POST /api/user/payment-razorpay`
- `POST /api/user/verifyRazorpay`
- `POST /api/user/payment-razorpayai`
- `POST /api/user/verifyRazorpayai`
- `POST /api/user/addTest`
- `GET /api/user/getTest`
- `POST /api/user/addreport`
- `GET /api/user/getreports`

### Admin Routes

- `POST /api/admin/add-doctor`
- `POST /api/admin/login`
- `GET /api/admin/all-doctors`
- `GET /api/admin/appointments`
- `POST /api/admin/change-availability`
- `POST /api/admin/cancel-appointment`
- `GET /api/admin/dashboard`

### Doctor Routes

- `GET /api/doctor/list`

## Current Limitations

- There are no automated tests in the backend package yet.
- The three apps are not wired together through a single root workspace command, so each one should be started separately during development.
