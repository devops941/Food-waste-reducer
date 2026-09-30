import { useState, useEffect, useCallback } from 'react';
import pantryService from '../services/pantryService';
import { useToast } from './useToast';

export function usePantry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pantryService.getItems({
        category: category !== 'All' ? category : undefined,
        search: search.trim() || undefined,
      });
      setItems(data?.items || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message, 'Error Loading Pantry');
    } finally {
      setLoading(false);
    }
  }, [category, search, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (itemData) => {
    try {
      const data = await pantryService.addItem(itemData);
      toast.success(`Added ${data.item.name} to pantry!`, 'Pantry Updated');
      await fetchItems();
      return data.item;
    } catch (err) {
      toast.error(err.message, 'Failed to Add Item');
      throw err;
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const data = await pantryService.updateItem(id, itemData);
      toast.success(`Updated ${data.item.name}`, 'Changes Saved');
      await fetchItems();
      return data.item;
    } catch (err) {
      toast.error(err.message, 'Failed to Update Item');
      throw err;
    }
  };

  const deleteItem = async (id, itemName = 'Item') => {
    try {
      await pantryService.deleteItem(id);
      toast.info(`Removed ${itemName} from pantry`, 'Item Deleted');
      await fetchItems();
    } catch (err) {
      toast.error(err.message, 'Failed to Delete Item');
      throw err;
    }
  };

  const markAsUsed = async (id, itemName = 'Item') => {
    try {
      const res = await pantryService.markAsUsed(id);
      toast.success(res.message || `Cooked ${itemName}! Food saved.`, 'Great Job! 🌿');
      await fetchItems();
    } catch (err) {
      toast.error(err.message, 'Action Failed');
      throw err;
    }
  };

  const markAsWasted = async (id, itemName = 'Item') => {
    try {
      await pantryService.markAsWasted(id);
      toast.warning(`Marked ${itemName} as wasted.`, 'Pantry Updated');
      await fetchItems();
    } catch (err) {
      toast.error(err.message, 'Action Failed');
      throw err;
    }
  };

  // Computed summary counts
  const expiringSoonItems = items.filter((i) => i.daysRemaining >= 0 && i.daysRemaining <= 3);
  const expiredItems = items.filter((i) => i.daysRemaining < 0);
  const freshItems = items.filter((i) => i.daysRemaining > 3);

  return {
    items,
    loading,
    error,
    category,
    setCategory,
    search,
    setSearch,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    markAsUsed,
    markAsWasted,
    expiringSoonItems,
    expiredItems,
    freshItems,
    totalCount: items.length,
  };
}

export default usePantry;
