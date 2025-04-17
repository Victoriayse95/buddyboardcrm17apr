import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  label = "Export to Excel",
  className = "",
  disabled = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 ${className}`}
    >
      <ArrowDownTrayIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
};

export default ExportButton; 