import React from 'react';
import { Leaf, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-charcoal-border/50 bg-cream-50/60 py-10">
      <div className="max-w-content mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-600 flex items-center justify-center">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <p className="font-serif text-sm font-semibold text-charcoal">
              Pantry Fresh
            </p>
            <p className="text-xs text-charcoal-muted">
              Mindful cooking, zero wasted food.
            </p>
          </div>
        </div>

        <p className="text-xs text-charcoal-muted flex items-center justify-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" /> for a greener planet & mindful kitchens.
        </p>

        <div className="text-xs text-charcoal-faint">
          © {new Date().getFullYear()} Pantry Fresh. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
