import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  }[size] || 'w-6 h-6 border-2';
  
  return (
    <div className={`loading-spinner ${sizeClass}`}></div>
  );
};

export default LoadingSpinner;
