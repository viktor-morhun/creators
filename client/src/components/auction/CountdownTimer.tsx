import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: number; // timestamp in milliseconds
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  const [isEnded, setIsEnded] = useState<boolean>(false);

  useEffect(() => {
    // Calculate time remaining
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      // Check if auction has ended
      if (distance <= 0) {
        setIsEnded(true);
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        };
      }

      // Calculate days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        total: distance
      };
    };

    // Set initial time
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // Clear interval on unmount
    return () => clearInterval(timer);
  }, [endTime]);

  // Get display text and style
  const getDisplayText = () => {
    if (isEnded) {
      return "Auction Ended";
    }

    const { days, hours, minutes, seconds } = timeRemaining;

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  };

  // Urgency level for styling
  const getUrgencyLevel = () => {
    if (isEnded) {
      return "ended";
    }
    
    const { days, hours, minutes } = timeRemaining;
    
    if (days === 0 && hours === 0 && minutes < 10) {
      return "urgent";
    }
    
    if (days === 0 && hours < 1) {
      return "soon";
    }
    
    return "normal";
  };

  const urgencyLevel = getUrgencyLevel();
  
  // Dynamic classes based on urgency level
  const containerClasses = {
    normal: "bg-black bg-opacity-60 text-white",
    soon: "bg-yellow-600 bg-opacity-80 text-white",
    urgent: "bg-red-600 text-white animate-pulse",
    ended: "bg-gray-700 text-gray-300"
  };

  const iconClasses = {
    normal: "text-white",
    soon: "text-yellow-200",
    urgent: "text-red-200",
    ended: "text-gray-400"
  };

  return (
    <div className={`px-2 py-1 rounded-lg flex items-center space-x-1 backdrop-blur-sm ${containerClasses[urgencyLevel as keyof typeof containerClasses]}`}>
      {!isEnded ? (
        <svg 
          className={`w-3 h-3 ${iconClasses[urgencyLevel as keyof typeof iconClasses]}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ) : (
        <svg 
          className={`w-3 h-3 ${iconClasses[urgencyLevel as keyof typeof iconClasses]}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      )}
      <span className="text-xs font-medium tracking-tight">{getDisplayText()}</span>
    </div>
  );
};

export default CountdownTimer;