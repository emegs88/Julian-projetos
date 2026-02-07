import React from 'react';
import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-11 h-6 rounded-full transition-colors',
            checked ? 'bg-primary' : 'bg-gray-300'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </div>
      </div>
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
}
