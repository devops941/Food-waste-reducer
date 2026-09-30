import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  ShieldCheck, 
  AlertOctagon, 
  Sparkles 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import statsService from '../services/statsService';
import { useToast } from '../hooks/useToast';
import { 
  PageHeader, 
  StatCard, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  Loader,
  Badge
} from '../components/ui';
import { formatCurrency } from '../utils/dateUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3.5 rounded-2xl border border-charcoal-border shadow-soft-lg text-xs space-y-1.5">
        <p className="font-bold text-charcoal">{label}</p>
        <div className="flex items-center gap-2 text-sage-700">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-500" />
          <span>Items Rescued: <strong>{payload[0]?.value || 0}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-status-expired">
          <span className="w-2.5 h-2.5 rounded-full bg-status-expired" />
          <span>Items Wasted: <strong>{payload[1]?.value || 0}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

export function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsService.getDashboardStats();
        setData(res);
      } catch (err) {
        toast.error(err.message, 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) {
    return <Loader message="Calculating household impact & savings..." />;
  }

  const stats = data?.stats || {};
  const monthlyStats = data?.monthlyStats || [];

  const totalSavedCount = stats.itemsSavedCount || 0;
  const totalWastedCount = stats.itemsWastedCount || 0;
  const totalDecided = totalSavedCount + totalWastedCount;
  const rescueRate = totalDecided > 0 ? Math.round((totalSavedCount / totalDecided) * 100) : 100;
  
  // Approximate environmental metrics
  const estLbsRescued = (totalSavedCount * 1.8).toFixed(1);
  const estCo2PreventedKg = (totalSavedCount * 2.5).toFixed(1);

  // Format monthly history for Recharts
  const chartData = monthlyStats.length > 0 ? monthlyStats.map((item) => ({
    month: item.month,
    saved: item.itemsSavedCount || 0,
    wasted: item.itemsWastedCount || 0,
    moneySaved: item.moneySaved || 0,
  })) : [
    { month: 'Current', saved: totalSavedCount, wasted: totalWastedCount, moneySaved: stats.moneySaved || 0 }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Impact & Waste Insights"
        subtitle="Track dollars saved, food rescued, and your household environmental footprint over time."
        badge={
          <Badge variant="sage" dot>
            Zero-Waste Metrics
          </Badge>
        }
      />

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Money Reclaimed"
          value={formatCurrency(stats.moneySaved || 0)}
          subtitle="Direct grocery savings"
          color="terracotta"
          icon={<DollarSign className="w-5 h-5" />}
        />

        <StatCard
          label="Food Rescue Rate"
          value={`${rescueRate}%`}
          subtitle={`${totalSavedCount} rescued vs ${totalWastedCount} spoiled`}
          color="fresh"
          icon={<ShieldCheck className="w-5 h-5" />}
        />

        <StatCard
          label="Food Rescued"
          value={`${estLbsRescued} lbs`}
          subtitle={`~${estCo2PreventedKg} kg CO₂ eq. diverted`}
          color="sage"
          icon={<Leaf className="w-5 h-5" />}
        />
      </div>

      {/* Monthly Saved vs Wasted Chart */}
      <Card className="p-5 sm:p-7 space-y-6">
        <CardHeader className="pb-2 mb-2">
          <div>
            <CardTitle>Food Rescued vs. Spoiled (Monthly)</CardTitle>
            <CardDescription>
              Visual comparison of ingredients cooked before expiring versus items wasted.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-sage-800">
              <span className="w-3 h-3 rounded-full bg-sage-500" /> Rescued
            </span>
            <span className="flex items-center gap-1.5 text-status-expired">
              <span className="w-3 h-3 rounded-full bg-status-expired" /> Spoiled
            </span>
          </div>
        </CardHeader>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E2" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6B7A70' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#6B7A70' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="saved" name="Rescued" fill="#4F7A4A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="wasted" name="Spoiled" fill="#C9503F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Environmental & Household Impact Note */}
      <div className="bg-gradient-to-r from-sage-50 via-cream-100 to-terracotta-50 rounded-3xl p-6 sm:p-8 border border-sage-200/80 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sage-500 text-white flex items-center justify-center shrink-0 shadow-soft-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-charcoal">
              Every single meal makes a difference
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed max-w-2xl">
              By planning meals with near-expiry items, you keep organic matter out of municipal landfills where it produces methane, while keeping hard-earned money in your household budget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsPage;
