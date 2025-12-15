import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input = ({
    label,
    error,
    leftIcon,
    className = '',
    ...props
}: InputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`
            ${className}
            w-full rounded-xl border
            px-4 py-3
            transition-all duration-200
            focus:ring-2 focus:ring-purple-500/20 focus:outline-none
            disabled:opacity-50
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${!className.includes('bg-') ? 'bg-white dark:bg-slate-900' : ''}
            ${!className.includes('text-') ? 'text-gray-900 dark:text-white' : ''}
            ${!className.includes('placeholder') ? 'placeholder-gray-400' : ''}
            ${!className.includes('border-') && !error ? 'border-gray-200 dark:border-slate-700' : ''}
            ${!className.includes('focus:border-') ? 'focus:border-purple-500' : ''}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500 animate-pulse">
                    {error}
                </p>
            )}
        </div>
    );
};
