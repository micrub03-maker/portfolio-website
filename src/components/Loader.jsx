import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Loader = ({ setIsLoaded }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (setIsLoaded) {
      setIsLoaded(true);
    } else {
      navigate('/home');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-800 bg-cover bg-center flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      {/* TODO: replace bg-gray-800 with bg-[url('/images/background-picture.jpg')] once the asset is provided */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/20 text-sm font-mono">TEMP: background-picture</span>
      </div>

      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center text-white px-6 max-w-2xl md:max-w-6xl mx-auto gap-4">
        <h1 className="text-5xl md:text-8xl font-bold md:whitespace-nowrap">
          Hey there! I'm Michael
        </h1>

        <p className="text-xl md:text-3xl font-medium md:whitespace-nowrap">
          Mechanical/Controls Engineer @ MPC lab Berkeley
        </p>

        <p className="text-lg md:text-2xl text-white/80 md:whitespace-nowrap">
          UC Berkeley MEng Mechanical Engineering '26, TU Delft BSc Mechanical Engineering '24
        </p>

        <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
          <br />
          <br />
          Welcome to my portfolio website, glad you stopped by :)
          <br />
          My goal is to give you a clear sense of what drives me, how I learn and solve problems, and the kind of
          energy I bring to a team. 
        </p>
        
        <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
          Have fun browsing!
        </p>

        <p className="text-sm text-white/50 mt-4 tracking-widest uppercase animate-pulse">
          <br />
          <br />
          <br />
          Click anywhere to continue
        </p>
      </div>
    </div>
  );
};
