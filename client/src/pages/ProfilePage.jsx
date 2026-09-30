import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  MessageSquare, 
  ShieldCheck, 
  Save, 
  Sparkles,
  Send
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import authService from '../services/authService';
import statsService from '../services/statsService';
import { 
  PageHeader, 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  FilterChips,
  Select,
  Badge 
} from '../components/ui';

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

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(2);

  const [isSaving, setIsSaving] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [isTestingReminder, setIsTestingReminder] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDietaryPreferences(user.dietaryPreferences || []);
      setEmailEnabled(user.reminderSettings?.emailEnabled ?? true);
      setWhatsappEnabled(user.reminderSettings?.whatsappEnabled ?? false);
      setDaysBeforeExpiry(user.reminderSettings?.daysBeforeExpiry ?? 2);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        dietaryPreferences,
        reminderSettings: {
          emailEnabled,
          whatsappEnabled,
          daysBeforeExpiry: Number(daysBeforeExpiry),
        },
      });
      toast.success('Your profile preferences have been updated!', 'Settings Saved');
    } catch (err) {
      toast.error(err.message, 'Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!email) {
      toast.warning('No email address found in profile.');
      return;
    }
    setIsTestingEmail(true);
    try {
      const res = await authService.testEmail(email);
      if (res.success) {
        toast.success(res.message || `Test email dispatched to ${email}!`, 'Email Sent ✉️');
      } else {
        toast.error(res.message || 'Failed to send test email.');
      }
    } catch (err) {
      toast.error(err.message, 'Email Dispatch Failed');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!phone) {
      toast.warning('Please enter a phone number with country code first (e.g. +1... or +91...)');
      return;
    }
    setIsTestingWhatsApp(true);
    try {
      const res = await authService.testWhatsApp(phone);
      if (res.success) {
        toast.success('Test WhatsApp message sent successfully!', 'WhatsApp Active');
      } else {
        toast.info(res.message || 'WhatsApp message triggered. Check server credentials.');
      }
    } catch (err) {
      toast.error(err.message, 'WhatsApp Error');
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const handleTestFullReminder = async () => {
    setIsTestingReminder(true);
    try {
      const res = await statsService.triggerReminder();
      toast.success(res.message || 'Dispatched reminder to your active channels!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsTestingReminder(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Account & Reminders"
        subtitle="Manage your profile, dietary preferences, and automated multi-channel expiry alerts."
      />

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <Card className="p-6 space-y-5 bg-white shadow-soft">
          <CardHeader className="pb-3 mb-1">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your name and contact channels for pantry updates.</CardDescription>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              value={email}
              disabled
              helperText="Managed by account authentication"
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-2">
            <Input
              label="WhatsApp Phone Number"
              placeholder="+1234567890 (with country code)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Meta Business API sends zero-waste reminders to this number"
            />
          </div>
        </Card>

        {/* Dietary Preferences Card */}
        <Card className="p-6 space-y-4 bg-white shadow-soft">
          <CardHeader className="pb-3 mb-1">
            <div>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>
                AI recipe generator will automatically honor these preferences.
              </CardDescription>
            </div>
          </CardHeader>

          <FilterChips
            options={DIETARY_OPTIONS}
            value={dietaryPreferences}
            onChange={setDietaryPreferences}
            isMulti={true}
          />
        </Card>

        {/* Reminder Settings Card */}
        <Card className="p-6 space-y-5 bg-white shadow-soft">
          <CardHeader className="pb-3 mb-1">
            <div>
              <CardTitle>Automated Expiry Alerts</CardTitle>
              <CardDescription>
                Daily 8:00 AM notifications when items are near expiration.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4">
            {/* Email Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-cream-50/60 border border-cream-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sage-100 text-sage-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Daily Email Digest</h4>
                  <p className="text-xs text-charcoal-muted">Receive a morning list of expiring food items</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-sage-600 focus:ring-sage-500 accent-sage-600 cursor-pointer"
              />
            </div>

            {/* WhatsApp Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-cream-50/60 border border-cream-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">WhatsApp Instant Reminder</h4>
                  <p className="text-xs text-charcoal-muted">Direct Meta Cloud API WhatsApp alert to your phone</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-sage-600 focus:ring-sage-500 accent-sage-600 cursor-pointer"
              />
            </div>

            {/* Days before expiry selector */}
            <div className="max-w-xs">
              <Select
                label="Alert Timing"
                value={daysBeforeExpiry}
                onChange={(e) => setDaysBeforeExpiry(Number(e.target.value))}
                options={[
                  { label: '1 day before expiry', value: 1 },
                  { label: '2 days before expiry (Recommended)', value: 2 },
                  { label: '3 days before expiry', value: 3 },
                  { label: '5 days before expiry', value: 5 },
                ]}
              />
            </div>

            {/* Test buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestEmail}
                isLoading={isTestingEmail}
                leftIcon={<Mail className="w-3.5 h-3.5 text-sage-600" />}
              >
                Test Email Alert
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestWhatsApp}
                isLoading={isTestingWhatsApp}
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Test WhatsApp API
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestFullReminder}
                isLoading={isTestingReminder}
                leftIcon={<Send className="w-3.5 h-3.5 text-terracotta-600" />}
              >
                Trigger Full Expiry Check
              </Button>
            </div>
          </div>
        </Card>

        {/* Form Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Preferences
          </Button>
        </div>

      </form>
    </div>
  );
}

export default ProfilePage;
