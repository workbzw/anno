import { ReactNode } from 'react';

interface GridItemProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledText?: string;
}

export default function GridItem({ icon, title, description, onClick, disabled = false, disabledText }: GridItemProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm transition-shadow duration-200 p-6 border border-gray-100 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-md cursor-pointer hover:border-purple-200'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex justify-center ${disabled ? 'text-gray-400' : 'text-purple-600'}`}>
          {typeof icon === 'string' ? (
            <div className="text-4xl">{icon}</div>
          ) : (
            icon
          )}
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {disabled && disabledText ? disabledText : description}
        </p>
      </div>
    </div>
  );
}