import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Refrigerator, 
  AlertTriangle, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  ChefHat, 
  Bell,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import statsService from '../services/statsService';
import pantryService from '../services/pantryService';
import { 
  PageHeader, 
  StatCard, 
  Button, 
  Loader,
  Card 
} from '../components/ui';
import UseTheseFirstList from '../components/dashboard/UseTheseFirstList';
import ExpiryMiniChart from '../components/dashboard/ExpiryMiniChart';
import { formatCurrency } from '../utils/dateUtils';

export function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTriggeringReminder, setIsTriggeringReminder] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await statsService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      toast.error(err.message, 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCookItem = async (item) => {
    try {
      const res = await pantryService.markAsUsed(item._id);
      toast.success(res.message || `Cooked ${item.name}!`, 'Food Saved 🌿');
      await fetchDashboard();
    } catch (err) {
      toast.error(err.message, 'Action Failed');
    }
  };

  const handleTriggerReminder = async () => {
    setIsTriggeringReminder(true);
    try {
      const res = await statsService.triggerReminder();
      toast.success(res.message || 'Expiry check triggered successfully!', 'Reminder Dispatched');
    } catch (err) {
      toast.error(err.message, 'Reminder Error');
    } finally {
      setIsTriggeringReminder(false);
    }
  };

  if (loading) {
    return <Loader message="Gathering pantry freshness..." />;
  }

  const stats = dashboardData?.stats || {};
  const useTheseFirst = dashboardData?.useTheseFirst || [];
  const weeklyDistribution = dashboardData?.weeklyDistribution || [];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Greeting */}
      <PageHeader
        title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'Chef'} 🌿`}
        subtitle="Here is your kitchen freshness overview and ingredients to cook today."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerReminder}
              isLoading={isTriggeringReminder}
              leftIcon={<Bell className="w-3.5 h-3.5 text-sage-600" />}
              title="Test sending reminder to Email & WhatsApp"
            >
              Test Reminder
            </Button>
            <Link to="/recipes">
              <Button
                variant="terracotta"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Cook with AI
              </Button>
            </Link>
          </div>
        }
      />

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link to="/pantry">
          <StatCard
            label="Items in Pantry"
            value={stats.totalItems || 0}
            subtitle="Active ingredients"
            color="sage"
            icon={<Refrigerator className="w-5 h-5" />}
            className="hover:-translate-y-0.5"
          />
        </Link>

        <Link to="/pantry">
          <StatCard
            label="Expiring Soon"
            value={stats.expiringSoonCount || 0}
            subtitle={stats.expiringSoonCount > 0 ? 'Within next 3 days' : 'No items urgent'}
            color={stats.expiringSoonCount > 0 ? 'amber' : 'fresh'}
            icon={<AlertTriangle className="w-5 h-5" />}
            className="hover:-translate-y-0.5"
          />
        </Link>

        <Link to="/insights">
          <StatCard
            label="Money Saved"
            value={formatCurrency(stats.moneySaved || 0)}
            subtitle={`${stats.itemsSavedCount || 0} items rescued this month`}
            color="terracotta"
            icon={<DollarSign className="w-5 h-5" />}
            className="hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {/* Recipe Suggestion Teaser Card */}
      {useTheseFirst.length > 0 && (
        <div className="bg-gradient-to-r from-sage-100/90 via-cream-100 to-terracotta-50 rounded-2xl p-5 sm:p-6 border border-sage-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sage-500 text-white flex items-center justify-center shrink-0 shadow-soft-sm">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-sage-700 uppercase tracking-wider">
                Smart Recipe Match
              </span>
              <h3 className="font-serif text-lg font-semibold text-charcoal">
                Turn your {useTheseFirst.map((i) => i.name).slice(0, 2).join(' & ')} into dinner tonight
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Our AI chef can craft 3 tailored recipes prioritizing your soon-to-expire ingredients.
              </p>
            </div>
          </div>

          <Link to="/recipes" className="shrink-0">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Suggest Recipes
            </Button>
          </Link>
        </div>
      )}

      {/* 2-Column: Use These First + Expiry Mini Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UseTheseFirstList
          items={useTheseFirst}
          onCookItem={handleCookItem}
        />

        <ExpiryMiniChart data={weeklyDistribution} />
      </div>
    </div>
  );
}

export default DashboardPage;
