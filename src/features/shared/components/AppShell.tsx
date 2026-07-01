import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const AppShell = ({ children, title, description }: AppShellProps) => {
  return (
    <section className="app-shell">
      <header className="app-shell__header">
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      <div className="app-shell__content">{children}</div>
    </section>
  );
};
