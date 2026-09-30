import ShoppingItem from '../models/ShoppingItem.js';

// @desc    Get all shopping items for user
// @route   GET /api/shopping
// @access  Private
export const getShoppingItems = async (req, res, next) => {
  try {
    const items = await ShoppingItem.find({ user: req.user._id }).sort({ isChecked: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a single item to shopping list
// @route   POST /api/shopping
// @access  Private
export const addShoppingItem = async (req, res, next) => {
  try {
    const { name, quantity, category } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const item = await ShoppingItem.create({
      user: req.user._id,
      name: name.trim(),
      quantity: quantity || '1',
      category: category || 'General',
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add missing recipe ingredients in bulk to shopping list
// @route   POST /api/shopping/bulk
// @access  Private
export const addBulkShoppingItems = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    const itemsToInsert = items.map((item) => ({
      user: req.user._id,
      name: typeof item === 'string' ? item.trim() : (item.name || '').trim(),
      quantity: typeof item === 'object' && item.quantity ? item.quantity : '1',
      category: typeof item === 'object' && item.category ? item.category : 'Recipe Ingredient',
    })).filter((i) => i.name.length > 0);

    const inserted = await ShoppingItem.insertMany(itemsToInsert);

    res.status(201).json({
      success: true,
      message: `Added ${inserted.length} missing ingredients to your shopping list!`,
      count: inserted.length,
      items: inserted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item checked state
// @route   PUT /api/shopping/:id
// @access  Private
export const toggleShoppingItem = async (req, res, next) => {
  try {
    const item = await ShoppingItem.findOne({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Shopping item not found' });
    }

    if (req.body.isChecked !== undefined) {
      item.isChecked = req.body.isChecked;
    } else {
      item.isChecked = !item.isChecked;
    }

    if (req.body.name) item.name = req.body.name;
    if (req.body.quantity) item.quantity = req.body.quantity;

    await item.save();

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single shopping item
// @route   DELETE /api/shopping/:id
// @access  Private
export const deleteShoppingItem = async (req, res, next) => {
  try {
    const item = await ShoppingItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Shopping item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from shopping list',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all checked items
// @route   DELETE /api/shopping/clear/checked
// @access  Private
export const clearCheckedItems = async (req, res, next) => {
  try {
    const result = await ShoppingItem.deleteMany({ user: req.user._id, isChecked: true });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} completed items`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
