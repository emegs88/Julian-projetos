'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { formatBRL, parseBRL } from '@/lib/utils';

interface InputMoneyProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
}

export function InputMoney({ value, onChange, label, error, ...props }: InputMoneyProps) {
  const [displayValue, setDisplayValue] = useState(formatBRL(value || 0));

  useEffect(() => {
    setDisplayValue(formatBRL(value || 0));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseBRL(rawValue);
    
    // Validar valor antes de atualizar
    if (!isNaN(numericValue) && isFinite(numericValue) && numericValue >= 0) {
      onChange(numericValue);
    } else if (rawValue === '' || rawValue === 'R$') {
      // Permitir campo vazio temporariamente
      onChange(0);
    }
  };

  const handleBlur = () => {
    setDisplayValue(formatBRL(value || 0));
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
