import React from 'react';

export const LoadingSpinner = ({ message = 'Loading system data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-b-indigo-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-4 text-sm text-slate-400 font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
