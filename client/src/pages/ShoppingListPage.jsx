import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  Refrigerator, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import shoppingService from '../services/shoppingService';
import pantryService from '../services/pantryService';
import { useToast } from '../hooks/useToast';
import { 
  PageHeader, 
  Button, 
  Input, 
  Card, 
  EmptyState, 
  Loader, 
  Badge 
} from '../components/ui';
import { cn } from '../utils/cn';

export function ShoppingListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  const toast = useToast();

  const fetchItems = async () => {
    try {
      const data = await shoppingService.getItems();
      setItems(data.items || []);
    } catch (err) {
      toast.error(err.message, 'Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsAdding(true);
    try {
      const res = await shoppingService.addItem({
        name: newItemName.trim(),
        quantity: newItemQty.trim() || '1',
      });
      setItems((prev) => [res.item, ...prev]);
      setNewItemName('');
      setNewItemQty('1');
      toast.success(`Added ${res.item.name} to list`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (item) => {
    const updatedStatus = !item.isChecked;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isChecked: updatedStatus } : i))
    );

    try {
      await shoppingService.toggleItem(item._id, updatedStatus);
    } catch (err) {
      toast.error(err.message);
      fetchItems(); // revert on failure
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await shoppingService.deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.info(`Removed ${name}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleClearChecked = async () => {
    try {
      const res = await shoppingService.clearChecked();
      setItems((prev) => prev.filter((i) => !i.isChecked));
      toast.success(res.message || 'Cleared checked items');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMoveToPantry = async (item) => {
    try {
      const defaultExp = new Date();
      defaultExp.setDate(defaultExp.getDate() + 5);

      await pantryService.addItem({
        name: item.name,
        quantity: item.quantity,
        category: 'Produce',
        expiryDate: defaultExp.toISOString().split('T')[0],
      });

      // Remove from shopping list
      await shoppingService.deleteItem(item._id);
      setItems((prev) => prev.filter((i) => i._id !== item._id));

      toast.success(`Moved ${item.name} into your pantry! 🌿`, 'Pantry Updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const checkedCount = items.filter((i) => i.isChecked).length;
  const uncheckedItems = items.filter((i) => !i.isChecked);
  const checkedItems = items.filter((i) => i.isChecked);

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Shopping List"
        subtitle="Keep track of missing staples and replenish your pantry effortlessly."
        actions={
          checkedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChecked}
              className="text-xs text-charcoal-muted hover:text-status-expired"
            >
              Clear Completed ({checkedCount})
            </Button>
          )
        }
      />

      {/* Quick Add Form */}
      <Card className="p-4 sm:p-5 bg-white shadow-soft">
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="What do you need? (e.g. Olive Oil, Garlic, Almond Flour)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />
          </div>

          <div className="w-full sm:w-28">
            <Input
              placeholder="Qty (1)"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isAdding}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0"
          >
            Add Item
          </Button>
        </form>
      </Card>

      {/* Shopping List Items */}
      {loading ? (
        <Loader message="Loading your checklist..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-7 h-7" />}
          title="Your shopping list is clear"
          description="Add items manually or use the 'Add Missing to Shopping List' button inside recipe cards."
        />
      ) : (
        <div className="space-y-6">
          {/* To Buy Section */}
          {uncheckedItems.length > 0 && (
            <Card className="p-2 sm:p-4 bg-white shadow-soft divide-y divide-cream-200">
              <div className="px-3 py-2 text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
                To Buy ({uncheckedItems.length})
              </div>
              {uncheckedItems.map((item) => (
                <div
                  key={item._id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-cream-50/50 rounded-xl transition-colors group"
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => handleToggle(item)}
                      className="w-5 h-5 rounded-lg text-sage-600 focus:ring-sage-500 border-charcoal-border cursor-pointer accent-sage-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-charcoal block">
                        {item.name}
                      </span>
                      {item.category && item.category !== 'General' && (
                        <span className="text-[10px] text-charcoal-faint">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-charcoal-muted bg-cream-200 px-2 py-0.5 rounded-md">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.name)}
                      className="p-1.5 text-charcoal-faint hover:text-status-expired rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Purchased / Completed Section */}
          {checkedItems.length > 0 && (
            <Card className="p-2 sm:p-4 bg-cream-50/60 border-dashed divide-y divide-cream-200">
              <div className="px-3 py-2 text-xs font-semibold text-charcoal-faint uppercase tracking-wider">
                Bought ({checkedItems.length})
              </div>
              {checkedItems.map((item) => (
                <div
                  key={item._id}
                  className="p-3 flex items-center justify-between gap-3 rounded-xl opacity-75"
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => handleToggle(item)}
                      className="w-5 h-5 rounded-lg text-sage-600 focus:ring-sage-500 border-charcoal-border cursor-pointer accent-sage-600"
                    />
                    <span className="text-sm text-charcoal-muted line-through">
                      {item.name} ({item.quantity})
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMoveToPantry(item)}
                      leftIcon={<Refrigerator className="w-3.5 h-3.5 text-sage-700" />}
                      className="text-xs py-1 px-2.5 h-auto rounded-lg"
                      title="Add directly into Pantry"
                    >
                      Move to Pantry
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.name)}
                      className="p-1.5 text-charcoal-faint hover:text-status-expired rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default ShoppingListPage;
