import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Appointment from './pages/Appointment';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Labs } from './pages/Labs';
import { BrainTumorDetector } from './models/brain_tumor';
import { KidneyDiseaseDetector } from './models/kidney';
import { EyeDiseaseDetector } from './models/eye';
import { HeartDiseaseDetector } from './models/heart';
import { DiabeticDiseaseDetector } from './models/diabetes';
import ReportsPage from './pages/Reports';

import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import AdminLogin from './pages/Admin/AdminLogin';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import AdminLayout from './components/AdminLayout';

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer/>
      <Navbar/>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors/>} />
          <Route path='/doctors/:speciality' element={<Doctors/>} />
          <Route path='/login' element={<Login/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/my-appointments' element={<MyAppointments/>}/>
          <Route path='/appointment/:docId' element={<Appointment/>}/>
          <Route path='/my-profile' element={<MyProfile/>}/>

          <Route path ='/lab' element={<Labs/>}/>
          <Route path ='/brain_tumor' element={<BrainTumorDetector/>}/>
          <Route path='/kidney' element={<KidneyDiseaseDetector/>}/>
          <Route path='/eye' element={<EyeDiseaseDetector/>}/>
          <Route path='/heart_disease' element={<HeartDiseaseDetector/>}/>
          
          <Route path='/diabetic_disease' element={<DiabeticDiseaseDetector/>}/>

          
    

          <Route path='/reports' element={<ReportsPage/>}/>
                
          <Route element={<AdminLayout />}>
            <Route path='/admin-login' element={<AdminLogin />} />
            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/all-appointments' element={<AllAppointments />} />
            <Route path='/add-doctor' element={<AddDoctor />} />
            <Route path='/doctor-list' element={<DoctorsList />} />
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/doctor-appointments' element={<DoctorAppointments />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
          </Route>

        </Routes>
      <Footer/>
    </div>

  );
};

export default App;
