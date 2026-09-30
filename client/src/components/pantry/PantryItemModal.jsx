import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, DatePicker, Textarea, Button } from '../ui';

const CATEGORIES = [
  'Produce',
  'Dairy',
  'Meat & Poultry',
  'Seafood',
  'Bakery',
  'Pantry & Grains',
  'Frozen',
  'Beverages',
  'Condiments & Spices',
  'Other',
];

export function PantryItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '1',
    category: 'Produce',
    expiryDate: '',
    estimatedPrice: '3.50',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        quantity: initialData.quantity || '1',
        category: initialData.category || 'Produce',
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().split('T')[0]
          : '',
        estimatedPrice: initialData.estimatedPrice !== undefined
          ? String(initialData.estimatedPrice)
          : '3.50',
        notes: initialData.notes || '',
      });
    } else {
      // Default expiry: 4 days from now
      const defaultExp = new Date();
      defaultExp.setDate(defaultExp.getDate() + 4);
      setFormData({
        name: '',
        quantity: '1',
        category: 'Produce',
        expiryDate: defaultExp.toISOString().split('T')[0],
        estimatedPrice: '3.50',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Pantry Item' : 'Add to Pantry'}
      subtitle={initialData ? 'Update item details or expiration date.' : 'Log an ingredient to monitor freshness & recipes.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <Input
          label="Item Name"
          name="name"
          placeholder="e.g. Baby Spinach, Oat Milk, Sourdough"
          value={formData.name}
          onChange={handleChange}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity / Unit"
            name="quantity"
            placeholder="e.g. 250g, 1 carton, 4 slices"
            value={formData.quantity}
            onChange={handleChange}
            required
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={CATEGORIES}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label="Expiry Date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Est. Cost ($)"
            name="estimatedPrice"
            type="number"
            step="0.10"
            min="0"
            placeholder="3.50"
            value={formData.estimatedPrice}
            onChange={handleChange}
            helperText="Used to compute money saved when cooked"
          />
        </div>

        <Textarea
          label="Storage Location / Notes (Optional)"
          name="notes"
          placeholder="e.g. Crisper drawer, opened yesterday"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-cream-200">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Add to Pantry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default PantryItemModal;
