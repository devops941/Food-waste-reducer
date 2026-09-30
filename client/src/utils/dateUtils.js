/**
 * Utility functions for expiry calculation, formatting, and currency
 */

export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const target = new Date(expiryDate);
  const today = new Date();
  
  // Set to start of day for accurate day-count comparison
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate);
  if (days === null) return 'fresh';
  if (days < 0) return 'expired';
  if (days <= 3) return 'soon';
  return 'fresh';
}

export function getExpiryBadgeInfo(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate);
  if (days === null) {
    return {
      status: 'fresh',
      label: 'Fresh',
      daysLeft: null,
      bgClass: 'bg-status-fresh-bg text-status-fresh border-status-fresh/20',
      dotClass: 'bg-status-fresh',
    };
  }

  if (days < 0) {
    const expiredDaysAgo = Math.abs(days);
    return {
      status: 'expired',
      label: expiredDaysAgo === 0 ? 'Expired today' : `Expired ${expiredDaysAgo}d ago`,
      daysLeft: days,
      bgClass: 'bg-status-expired-bg text-status-expired border-status-expired/20',
      dotClass: 'bg-status-expired',
    };
  }

  if (days === 0) {
    return {
      status: 'soon',
      label: 'Expires today',
      daysLeft: 0,
      bgClass: 'bg-status-soon-bg text-status-soon border-status-soon/30',
      dotClass: 'bg-status-soon',
    };
  }

  if (days === 1) {
    return {
      status: 'soon',
      label: 'Expires tomorrow',
      daysLeft: 1,
      bgClass: 'bg-status-soon-bg text-status-soon border-status-soon/30',
      dotClass: 'bg-status-soon',
    };
  }

  if (days <= 3) {
    return {
      status: 'soon',
      label: `${days} days left`,
      daysLeft: days,
      bgClass: 'bg-status-soon-bg text-status-soon border-status-soon/30',
      dotClass: 'bg-status-soon',
    };
  }

  return {
    status: 'fresh',
    label: `${days} days left`,
    daysLeft: days,
    bgClass: 'bg-status-fresh-bg text-status-fresh border-status-fresh/20',
    dotClass: 'bg-status-fresh',
  };
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatCurrency(amount, currency = 'USD') {
  const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}
