import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  headerTitle?: React.ReactNode;
  headerSubtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  headerTitle,
  headerSubtitle,
  headerAction,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-md border border-ew-border bg-ew-panel/90 shadow-sm transition-colors',
          className
        )
      )}
      {...props}
    >
      {(headerTitle || headerAction) && (
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-ew-border bg-slate-900/60">
          <div>
            {typeof headerTitle === 'string' ? (
              <h3 className="font-mono text-xs font-semibold tracking-wide uppercase text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-ew-cyan rounded-full" />
                {headerTitle}
              </h3>
            ) : (
              headerTitle
            )}
            {headerSubtitle && <p className="text-[11px] text-ew-muted mt-0.5">{headerSubtitle}</p>}
          </div>
          {headerAction && <div className="flex items-center gap-1.5">{headerAction}</div>}
        </div>
      )}
      <div className="p-3.5">{children}</div>
    </div>
  );
};
