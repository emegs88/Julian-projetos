'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { formatPercent, parsePercent } from '@/lib/utils';

interface InputPercentProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  decimals?: number;
}

export function InputPercent({ value, onChange, label, error, decimals = 2, ...props }: InputPercentProps) {
  const [displayValue, setDisplayValue] = useState(formatPercent(value || 0, decimals));

  useEffect(() => {
    setDisplayValue(formatPercent(value || 0, decimals));
  }, [value, decimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parsePercent(rawValue);
    
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    setDisplayValue(formatPercent(value || 0, decimals));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(e) => {
          e.target.select();
        }}
        error={error}
        {...props}
      />
    </div>
  );
}
