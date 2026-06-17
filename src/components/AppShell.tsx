import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="phone-frame">
        <div className="phone-screen">{children}</div>
      </div>
    </div>
  );
}
