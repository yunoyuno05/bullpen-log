import React from 'react';

export const BaseballIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M5.5 4.5a12.3 12.3 0 0 1 0 15" />
      <path d="M18.5 4.5a12.3 12.3 0 0 0 0 15" />
      <path d="M7 6.5l1.5.5" />
      <path d="M6 10l1.5.5" />
      <path d="M6 14l1.5.5" />
      <path d="M7 17.5l1.5.5" />
      <path d="M17 6.5l-1.5.5" />
      <path d="M18 10l-1.5.5" />
      <path d="M18 14l-1.5.5" />
      <path d="M17 17.5l-1.5.5" />
    </svg>
  );
};
