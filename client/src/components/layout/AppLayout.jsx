import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export function AppLayout({ children, user, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
