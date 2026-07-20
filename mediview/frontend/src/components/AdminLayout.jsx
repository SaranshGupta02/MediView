import React, { useContext } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
// Use the frontend's Navbar or maybe we need to copy the Admin's Navbar
import AdminSidebar from './AdminSidebar'
import { ToastContainer } from 'react-toastify';

const AdminLayout = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const location = useLocation()
  
  if (location.pathname === '/admin-login') {
      return (
        <div className='bg-[#F8F9FD] min-h-screen'>
            <ToastContainer />
            <Outlet />
        </div>
      )
  }

  if (!dToken && !aToken) {
    return <Navigate to="/admin-login" />
  }

  return (
    <div className='bg-[#F8F9FD] min-h-screen w-full'>
      <ToastContainer />
      <div className='flex items-start w-full'>
        <AdminSidebar />
        <div className="flex-1">
           <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
