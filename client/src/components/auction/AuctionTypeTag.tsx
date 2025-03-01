import React from 'react';

interface AuctionTypeTagProps {
  type: 'english' | 'dutch' | 'sealed' | 'timed';
}

const AuctionTypeTag: React.FC<AuctionTypeTagProps> = ({ type }) => {
  // Configuration for different auction types
  const typeConfig = {
    english: {
      label: 'English',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    dutch: {
      label: 'Dutch',
      bgColor: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
        </svg>
      )
    },
    sealed: {
      label: 'Sealed',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    timed: {
      label: 'Timed',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const config = typeConfig[type];

  return (
    <div className={`flex items-center px-2 py-1 rounded-lg ${config.bgColor} ${config.hoverColor} text-white text-xs font-medium transition-colors`}>
      {config.icon}
      {config.label}
    </div>
  );
};

export default AuctionTypeTag;