import React from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
