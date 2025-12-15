import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
    onClick?: () => void;
}

export const Card = ({
    children,
    className = '',
    hover = false,
    glass = false,
    onClick
}: CardProps) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300 border';

    const glassStyles = glass
        ? 'backdrop-blur-xl shadow-xl'
        : 'border-purple-100 dark:border-slate-700 shadow-lg';

    const hoverStyles = hover
        ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700'
        : '';

    return (
        <div
            className={`${className} ${baseStyles} ${glassStyles} ${hoverStyles}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
