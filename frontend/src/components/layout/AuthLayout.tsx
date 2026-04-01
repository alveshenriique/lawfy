import { type ReactNode } from 'react';
import { Logo } from '../ui/Logo';
import { Footer } from './Footer';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page-container">
      <section className="auth-card">
        <header className="mb-10 text-center">
          <Logo />
        </header>
        {children}
        <Footer />
      </section>
    </main>
  );
}