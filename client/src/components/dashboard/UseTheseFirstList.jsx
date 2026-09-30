import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Utensils, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, StatusBadge, Button } from '../ui';
import { formatDate } from '../../utils/dateUtils';

export function UseTheseFirstList({ items = [], onCookItem }) {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg">Use These First</CardTitle>
              {items.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-soon-bg text-status-soon border border-status-soon/30">
                  Priority
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              Items expiring soonest that should be incorporated into today's meals.
            </CardDescription>
          </div>

          <Link to="/pantry">
            <span className="text-xs font-semibold text-sage-600 hover:text-sage-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </CardHeader>

        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-charcoal-muted">
            <span className="text-xl block mb-1">🌿</span>
            All clear! No items are immediately expiring.
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {items.map((item) => (
              <div
                key={item._id}
                className="py-3 flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-charcoal truncate">
                      {item.name}
                    </h4>
                    <StatusBadge expiryDate={item.expiryDate} className="text-[10px] py-0.5 px-2" />
                  </div>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Qty: {item.quantity} • {formatDate(item.expiryDate)}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onCookItem(item)}
                  className="shrink-0 text-xs py-1 px-2.5 rounded-lg"
                  title="Mark as Cooked"
                >
                  <Utensils className="w-3.5 h-3.5 mr-1" />
                  Cook
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default UseTheseFirstList;
