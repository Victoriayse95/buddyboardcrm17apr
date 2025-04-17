import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

/**
 * LoadingSpinner component for showing loading states
 */
export default function LoadingSpinner({ 
  size = 'md', 
  color = 'border-indigo-500' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} ${color} rounded-full animate-spin border-t-transparent`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
} 