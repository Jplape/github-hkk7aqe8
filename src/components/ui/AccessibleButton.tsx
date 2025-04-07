import { ReactNode } from 'react';

interface AccessibleButtonProps {
  children?: ReactNode;
  className?: string;
  ariaLabel: string;
  onClick?: () => void;
}

export const AccessibleButton = ({
  children,
  className = '',
  ariaLabel,
  onClick
}: AccessibleButtonProps) => {
  return (
    <button 
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children || (
        <span className="sr-only">{ariaLabel}</span>
      )}
    </button>
  );
};