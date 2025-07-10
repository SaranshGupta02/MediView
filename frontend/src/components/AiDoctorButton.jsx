import React from 'react';
import { assets } from '../assets/assets';

const AIDoctorButton = ({ scrollToRef }) => {

  const handleClick = () => {
    scrollToRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center space-y-2 transition-all duration-300 group-hover:scale-105">
        <div className="relative bg-white text-gray-800 text-lg sm:text-xl font-semibold px-8 py-4 rounded-full shadow-md animate-float max-w-[280px] text-center">
          ☁️ Try AI Doctor
          <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white transform -translate-x-1/2" />
        </div>
        <img 
          src={assets.pet} 
          alt="AI Doctor Robot" 
          style={{ width: '190px' }}
        />
      </div>
    </div>
  );
};

export default AIDoctorButton;
