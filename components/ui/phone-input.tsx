'use client';

import * as React from 'react';
import PhoneInputWithCountry from 'react-phone-number-input/react-hook-form';
import 'react-phone-number-input/style.css';
import { Input } from './input';
import { cn } from '@/lib/utils';

export type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> & {
  onChange?: (value: string | undefined) => void;
  value?: string;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    return (
      <div className={cn('flex', className)}>
        <Input
          type="tel"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="+1 (555) 000-0000"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
