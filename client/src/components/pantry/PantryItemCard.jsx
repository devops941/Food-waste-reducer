import React from 'react';
import { Utensils, Edit2, Trash2, AlertOctagon } from 'lucide-react';
import { Card, StatusBadge, Button } from '../ui';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

export function PantryItemCard({
  item,
  onEdit,
  onDelete,
  onCooked,
  onWasted,
}) {
  const isExpired = item.daysRemaining < 0;

  return (
    <Card hover className="flex flex-col justify-between p-5 space-y-4">
      {/* Top row: Category tag & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider bg-cream-200/80 px-2.5 py-0.5 rounded-md">
          {item.category}
        </span>
        <StatusBadge expiryDate={item.expiryDate} />
      </div>

      {/* Main Info */}
      <div className="space-y-1">
        <h4 className="font-serif text-lg font-semibold text-charcoal leading-snug">
          {item.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-charcoal-muted pt-1">
          <span className="font-medium text-charcoal-light">
            Qty: <span className="text-charcoal font-semibold">{item.quantity}</span>
          </span>
          <span>Expires {formatDate(item.expiryDate)}</span>
        </div>
        {item.notes && (
          <p className="text-xs text-charcoal-muted/80 italic pt-1 line-clamp-1">
            "{item.notes}"
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-cream-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="p-1.5 text-charcoal-muted hover:text-charcoal rounded-lg h-auto"
            title="Edit Item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="p-1.5 text-status-expired/80 hover:text-status-expired hover:bg-status-expired-bg rounded-lg h-auto"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          {isExpired && onWasted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onWasted(item)}
              className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg h-auto text-[11px]"
              title="Mark as Spoiled/Wasted"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onCooked(item)}
          leftIcon={<Utensils className="w-3.5 h-3.5" />}
          className="text-xs py-1.5 px-3"
        >
          I Cooked This
        </Button>
      </div>
    </Card>
  );
}

export default PantryItemCard;
