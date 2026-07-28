import React, { forwardRef } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="wellfound-label">{label}</label>}
      <input
        ref={ref}
        className={`${error ? 'wellfound-input-error' : 'wellfound-input'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
);
InputField.displayName = 'InputField';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="wellfound-label">{label}</label>}
      <textarea
        ref={ref}
        rows={4}
        className={`${error ? 'wellfound-input-error' : 'wellfound-input'} resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
);
TextAreaField.displayName = 'TextAreaField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="wellfound-label">{label}</label>}
      <select
        ref={ref}
        className={`${error ? 'wellfound-input-error' : 'wellfound-input'} cursor-pointer ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  )
);
SelectField.displayName = 'SelectField';
