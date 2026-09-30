import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button, Input, Card, FilterChips } from '../components/ui';

const DIETARY_OPTIONS = [
  'Non-Vegetarian',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Keto',
  'Nut-Free',
  'Halal',
  'Kosher',
];

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        name,
        email,
        password,
        phone,
        dietaryPreferences,
      });
      toast.success('Your zero-waste journey begins today!', 'Account Created');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-sage-500 text-white items-center justify-center shadow-soft-sm mb-1">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-charcoal">
            Join Pantry Fresh
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-xs mx-auto">
            Organize your pantry, prevent food waste, and save money effortlessly.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5 bg-white shadow-soft-lg">
          {error && (
            <div className="p-3.5 rounded-xl bg-status-expired-bg border border-status-expired/20 text-xs text-status-expired font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Maya Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

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
              label="Password (min. 6 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="new-password"
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Used for optional WhatsApp expiry reminders"
            />

            {/* Dietary Preference Selector */}
            <div className="pt-1 space-y-2">
              <label className="text-xs font-semibold text-charcoal tracking-wide block">
                Dietary Preferences (Optional)
              </label>
              <p className="text-[11px] text-charcoal-muted">
                Our AI chef will tailor all recipe suggestions to match these:
              </p>
              <FilterChips
                options={DIETARY_OPTIONS}
                value={dietaryPreferences}
                onChange={setDietaryPreferences}
                isMulti={true}
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Free Account
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-charcoal-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sage-700 hover:text-sage-800 underline underline-offset-4">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;
