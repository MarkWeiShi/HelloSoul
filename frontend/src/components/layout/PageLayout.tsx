import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  withNav?: boolean;
  includeTopSafe?: boolean;
}

export function PageLayout({
  children,
  withNav = true,
  includeTopSafe = true,
  className,
  ...rest
}: PageLayoutProps) {
  return (
    <div
      className={clsx(
        'app-page',
        withNav && 'app-page-with-nav',
        !includeTopSafe && 'app-page-no-top-safe',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
