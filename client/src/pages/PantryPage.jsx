import React, { useState } from 'react';
import { Plus, Search, Refrigerator, Sparkles, Filter } from 'lucide-react';
import { usePantry } from '../hooks/usePantry';
import { 
  PageHeader, 
  Button, 
  Input, 
  FilterChips, 
  EmptyState, 
  SkeletonCard, 
  ConfirmDialog,
  Chip
} from '../components/ui';
import PantryItemCard from '../components/pantry/PantryItemCard';
import PantryItemModal from '../components/pantry/PantryItemModal';

const CATEGORY_CHIPS = [
  'All',
  'Produce',
  'Dairy',
  'Meat & Poultry',
  'Seafood',
  'Bakery',
  'Pantry & Grains',
  'Frozen',
  'Beverages',
  'Condiments & Spices',
];

export function PantryPage() {
  const {
    items,
    loading,
    category,
    setCategory,
    search,
    setSearch,
    addItem,
    updateItem,
    deleteItem,
    markAsUsed,
    markAsWasted,
    expiringSoonItems,
    expiredItems,
  } = usePantry();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'soon', 'expired'

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem._id, formData);
      } else {
        await addItem(formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      // Toast handles error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete._id, itemToDelete.name);
      setItemToDelete(null);
    } catch (err) {
      // Toast handles error message
    }
  };

  // Filter items based on active status filter
  const filteredItems = items.filter((item) => {
    if (statusFilter === 'soon') return item.daysRemaining >= 0 && item.daysRemaining <= 3;
    if (statusFilter === 'expired') return item.daysRemaining < 0;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Kitchen Pantry"
        subtitle="Track freshness, organize ingredients, and use what you have before it expires."
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Item
          </Button>
        }
      />

      {/* Search & Filters Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-charcoal-border/70 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search pantry items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Quick Expiry Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Chip
              label="All Items"
              count={items.length}
              selected={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <Chip
              label="Expiring Soon"
              count={expiringSoonItems.length}
              selected={statusFilter === 'soon'}
              onClick={() => setStatusFilter('soon')}
              className={expiringSoonItems.length > 0 ? 'text-amber-800' : ''}
            />
            {expiredItems.length > 0 && (
              <Chip
                label="Expired"
                count={expiredItems.length}
                selected={statusFilter === 'expired'}
                onClick={() => setStatusFilter('expired')}
                className="text-status-expired"
              />
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="pt-2 border-t border-cream-200">
          <FilterChips
            options={CATEGORY_CHIPS}
            value={category}
            onChange={setCategory}
          />
        </div>
      </div>

      {/* Items Grid / Loading / Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Refrigerator className="w-7 h-7" />}
          title={search || category !== 'All' ? 'No matching pantry items' : 'Your pantry is currently empty'}
          description={
            search || category !== 'All'
              ? 'Try changing your search keywords or category filters.'
              : 'Add your groceries and perishables to start tracking freshness and getting instant recipes.'
          }
          actionLabel={search || category !== 'All' ? 'Clear Filters' : 'Add First Item'}
          onAction={
            search || category !== 'All'
              ? () => {
                  setSearch('');
                  setCategory('All');
                  setStatusFilter('all');
                }
              : handleOpenAdd
          }
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <PantryItemCard
              key={item._id}
              item={item}
              onEdit={handleOpenEdit}
              onDelete={setItemToDelete}
              onCooked={(it) => markAsUsed(it._id, it.name)}
              onWasted={(it) => markAsWasted(it._id, it.name)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <PantryItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingItem}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Pantry Item?"
        message={`Are you sure you want to remove "${itemToDelete?.name}" from your pantry?`}
        confirmLabel="Remove Item"
        variant="danger"
      />
    </div>
  );
}

export default PantryPage;
