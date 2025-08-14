import React from 'react';

interface LoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  color = '#e31837', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div 
      className={`inline-block rounded-full border-solid border-t-transparent animate-spin ${sizeClasses[size]} ${className}`}
      style={{ 
        borderColor: `${color} ${color} ${color} transparent`,
        animationDuration: '1s'
      }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
