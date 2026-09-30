import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button, Input, Card } from '../components/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back to Pantry Fresh!', 'Signed In');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message, 'Sign In Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@pantryfresh.app');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-sage-500 text-white items-center justify-center shadow-soft-sm mb-1">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-charcoal">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted">
            Sign in to manage your kitchen pantry & rescue food.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-white shadow-soft-lg">
          {error && (
            <div className="p-3.5 rounded-xl bg-status-expired-bg border border-status-expired/20 text-xs text-status-expired font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* 1-Click Demo Fill */}
          <div className="pt-2 border-t border-cream-200">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-800 text-xs font-semibold flex items-center justify-center gap-2 border border-sage-200/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span>Auto-fill Demo Credentials (1-Click)</span>
            </button>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-charcoal-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-sage-700 hover:text-sage-800 underline underline-offset-4">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;
