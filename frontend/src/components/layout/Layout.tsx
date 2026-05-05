import { type ReactNode } from 'react';
import { SideBar } from './SideBar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="dashboard-wrapper">
      <SideBar />
      <main className="main-content">
        <TopBar />
        <section className="content-inner">
          {children}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
