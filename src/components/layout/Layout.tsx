import type { ReactNode } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main
        style={{
          flex: 1,
          paddingTop: '56px', // header height
          paddingBottom: '64px', // mobile nav height
        }}
        className="md:pb-0"
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
