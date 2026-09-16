import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'tactical-active';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'border-sky-600 bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm active:bg-sky-700',
    secondary:
      'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white active:bg-slate-800',
    danger:
      'border-rose-700/60 bg-rose-950/60 hover:bg-rose-900 text-rose-300 active:bg-rose-950',
    ghost: 'border-transparent bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
    'tactical-active':
      'border-emerald-600/80 bg-emerald-950/60 text-emerald-300 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-mono',
    md: 'text-xs px-3 py-1.5 gap-2 font-mono',
    lg: 'text-sm px-4 py-2 gap-2.5 font-mono font-medium',
  };

  return (
    <button
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.99]',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
