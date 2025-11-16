import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseFieldProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

type FieldProps = InputFieldProps | TextareaFieldProps;

export default function Field({ label, error, helper, required, as = 'input', ...props }: FieldProps) {
  const baseClassName =
    'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const errorClassName = error
    ? 'border-red-300 bg-red-50'
    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500';

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {as === 'textarea' ? (
        <textarea
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={`${baseClassName} ${errorClassName} min-h-[120px] resize-y`}
        />
      ) : (
        <input
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
          className={`${baseClassName} ${errorClassName}`}
        />
      )}

      {helper && !error && <p className="mt-1.5 text-xs text-slate-500">{helper}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
