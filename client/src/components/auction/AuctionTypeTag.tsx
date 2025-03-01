import React from 'react';

interface AuctionTypeTagProps {
  type: number; // 0 for English, 1 for Dutch
  size?: 'small' | 'medium' | 'large';
}

const AuctionTypeTag: React.FC<AuctionTypeTagProps> = ({ type, size = 'medium' }) => {
  // Configuration for different auction types
  const typeConfig = {
    0: { // English auction
      label: 'English',
      bgColor: 'bg-purple-500',
      bgOpacity: 'bg-opacity-80',
      hoverColor: 'hover:bg-purple-600',
      icon: (
        <svg className="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    1: { // Dutch auction
      label: 'Dutch',
      bgColor: 'bg-blue-500',
      bgOpacity: 'bg-opacity-80',
      hoverColor: 'hover:bg-blue-600',
      icon: (
        <svg className="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
        </svg>
      )
    }
  };

  // Default to English auction if type is not recognized
  const config = typeConfig[type] || typeConfig[0];
  
  // Size configurations
  const sizeClasses = {
    small: {
      padding: 'px-1.5 py-0.5',
      text: 'text-xs',
      icon: 'w-2.5 h-2.5'
    },
    medium: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    large: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4'
    }
  };
  
  const sizeClass = sizeClasses[size];

  return (
    <div className={`flex items-center ${sizeClass.padding} rounded-md ${config.bgColor} ${config.bgOpacity} ${config.hoverColor} text-white ${sizeClass.text} font-medium transition-colors`}>
      {React.cloneElement(config.icon, { className: `${sizeClass.icon} ${config.icon.props.className}` })}
      {config.label}
    </div>
  );
};

export default AuctionTypeTag;