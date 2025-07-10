import React, { useRef } from 'react';
import Header from '../components/Header';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import SpecialityMenu from '../components/SpecialityMenu';
import AIDoctorButton from '../components/AiDoctorButton';
import AIDoctorPopupnew from '../components/AI_dctor';

const Home = () => {
  const aiDoctorRef = useRef(null);

  return (
    <div>
      <Header />
      <SpecialityMenu />
      <AIDoctorButton scrollToRef={aiDoctorRef} />

      
      <TopDoctors />
      
      <Banner />
      {/* Attach ref here */}
      <div ref={aiDoctorRef}>
        <AIDoctorPopupnew />
      </div>

    </div>
  );
};

export default Home;
