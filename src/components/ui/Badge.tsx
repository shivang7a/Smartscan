import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThreatLevel, TrackStatus } from '../../types/ew.types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'purple' | 'muted';
  threat?: ThreatLevel;
  status?: TrackStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  threat,
  status,
  size = 'md',
  children,
  ...props
}) => {
  let computedVariant = variant;

  if (threat) {
    if (threat === 'CRITICAL') computedVariant = 'crimson';
    else if (threat === 'HIGH') computedVariant = 'amber';
    else if (threat === 'MEDIUM') computedVariant = 'purple';
    else computedVariant = 'emerald';
  } else if (status) {
    if (status === 'INTERCEPTED') computedVariant = 'emerald';
    else if (status === 'TRACKING') computedVariant = 'cyan';
    else if (status === 'DETECTING') computedVariant = 'amber';
    else computedVariant = 'muted';
  }

  const styles = {
    cyan: 'border-sky-500/30 bg-sky-950/40 text-sky-400',
    emerald: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-950/40 text-amber-400',
    crimson: 'border-rose-500/30 bg-rose-950/50 text-rose-400 font-semibold',
    purple: 'border-purple-500/30 bg-purple-950/40 text-purple-400',
    muted: 'border-slate-700 bg-slate-800/60 text-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 font-mono',
    md: 'text-xs px-2 py-0.5 font-mono',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded border uppercase font-medium leading-none whitespace-nowrap',
          styles[computedVariant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {children || threat || status}
    </span>
  );
};
