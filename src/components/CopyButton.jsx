import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import toast from 'react-hot-toast';

const CopyButton = ({
  text,
  label = 'Copy',
  successLabel = 'Copied!',
  className = '',
  variant = 'default',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const result = await copyToClipboard(text);

    if (result.success) {
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const baseStyles = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all';

  const variants = {
    default: 'bg-surface hover:bg-slate-600 text-text-primary border border-slate-600',
    primary: 'bg-primary hover:bg-blue-600 text-white',
    success: 'bg-success hover:bg-green-600 text-white',
    ghost: 'hover:bg-slate-700 text-slate-300',
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        !text ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4" />
          <span>{successLabel}</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

const CopyIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default CopyButton;
