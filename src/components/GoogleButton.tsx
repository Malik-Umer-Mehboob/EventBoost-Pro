import React from 'react';
import googleLogo from '../assets/google.png';

interface GoogleButtonProps {
  onClick: () => void;
  text?: string;
  className?: string;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ 
  onClick, 
  text = "Continue with Google",
  className = "" 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full bg-white text-gray-900 p-3 rounded-xl font-semibold hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-md border border-gray-200 ${className}`}
    >
      <img 
        src={googleLogo} 
        alt="Google logo" 
        className="w-5 h-5 flex-shrink-0"
        loading="lazy"
      />
      <span>{text}</span>
    </button>
  );
};

export default GoogleButton;
