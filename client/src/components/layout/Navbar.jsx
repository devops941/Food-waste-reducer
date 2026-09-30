import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  Menu, 
  X, 
  Refrigerator, 
  Sparkles, 
  ShoppingCart, 
  TrendingUp, 
  Home, 
  LogOut, 
  User 
} from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../utils/cn';

export function Navbar({ user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { name: 'Pantry', path: '/pantry', icon: <Refrigerator className="w-4 h-4" /> },
    { name: 'Recipes', path: '/recipes', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Shopping List', path: '/shopping', icon: <ShoppingCart className="w-4 h-4" /> },
    { name: 'Insights', path: '/insights', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b border-charcoal-border/50">
      <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center text-white shadow-soft-sm group-hover:bg-sage-600 transition-colors">
            <Leaf className="w-5 h-5 transition-transform group-hover:rotate-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold text-charcoal tracking-tight leading-none">
              Pantry Fresh
            </span>
            <span className="text-[10px] text-sage-600 font-medium tracking-wide">
              Zero-Waste Kitchen
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-charcoal-border/50 shadow-soft-sm">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-smooth',
                    active
                      ? 'bg-sage-500 text-white shadow-soft-sm'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-cream-100'
                  )}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-charcoal-muted">
            <Link to="/#features" className="hover:text-charcoal transition-colors">How It Works</Link>
            <Link to="/#impact" className="hover:text-charcoal transition-colors">Impact</Link>
          </nav>
        )}

        {/* Right Action Slot */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
                  {user.name || 'Account'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-status-expired hover:bg-status-expired-bg"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-charcoal hover:bg-cream-200 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-charcoal-border/70 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-charcoal-muted uppercase">
                Navigation
              </div>
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-sage-100 text-sage-800'
                        : 'text-charcoal hover:bg-cream-100'
                    )}
                  >
                    <span className="text-sage-600">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-medium text-charcoal flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-sage-600" />
                  {user.name || 'Account'}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-status-expired text-xs"
                >
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
