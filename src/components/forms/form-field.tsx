type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

export function FormField({
  label,
  error,
  required = true,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-white/90">
        {label}
        {required && <span className="ml-1 text-pink-300">*</span>}
      </label>

      {children}

      {error && <p className="text-sm text-pink-200">{error}</p>}
    </div>
  );
}