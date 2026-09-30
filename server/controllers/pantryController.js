import PantryItem from '../models/PantryItem.js';
import WasteStat from '../models/WasteStat.js';

const getMonthString = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// @desc    Get all active pantry items for user
// @route   GET /api/pantry
// @access  Private
export const getPantryItems = async (req, res, next) => {
  try {
    const { category, search, showUsed } = req.query;
    const query = { user: req.user._id };

    if (!showUsed || showUsed === 'false') {
      query.isUsed = false;
      query.isWasted = false;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Sort by earliest expiry date first
    const items = await PantryItem.find(query).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single pantry item
// @route   GET /api/pantry/:id
// @access  Private
export const getPantryItemById = async (req, res, next) => {
  try {
    const item = await PantryItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new pantry item
// @route   POST /api/pantry
// @access  Private
export const addPantryItem = async (req, res, next) => {
  try {
    const { name, quantity, category, expiryDate, estimatedPrice, notes } = req.body;

    if (!name || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item name and expiry date',
      });
    }

    const item = await PantryItem.create({
      user: req.user._id,
      name,
      quantity: quantity || '1 item',
      category: category || 'Produce',
      expiryDate,
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : 3.5,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pantry item
// @route   PUT /api/pantry/:id
// @access  Private
export const updatePantryItem = async (req, res, next) => {
  try {
    let item = await PantryItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    const { name, quantity, category, expiryDate, estimatedPrice, notes } = req.body;

    item.name = name || item.name;
    item.quantity = quantity !== undefined ? quantity : item.quantity;
    item.category = category || item.category;
    item.expiryDate = expiryDate || item.expiryDate;
    if (estimatedPrice !== undefined) item.estimatedPrice = Number(estimatedPrice);
    if (notes !== undefined) item.notes = notes;

    await item.save();

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pantry item
// @route   DELETE /api/pantry/:id
// @access  Private
export const deletePantryItem = async (req, res, next) => {
  try {
    const item = await PantryItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from pantry',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark item as cooked/used
// @route   POST /api/pantry/:id/use
// @access  Private
export const markItemAsUsed = async (req, res, next) => {
  try {
    const item = await PantryItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    item.isUsed = true;
    item.usedAt = new Date();
    await item.save();

    // Record monthly saved stat
    const currentMonth = getMonthString();
    await WasteStat.findOneAndUpdate(
      { user: req.user._id, month: currentMonth },
      {
        $inc: {
          itemsSavedCount: 1,
          moneySaved: item.estimatedPrice || 3.5,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Marked "${item.name}" as used! Saved ~$${(item.estimatedPrice || 3.5).toFixed(2)}.`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark item as spoiled/wasted
// @route   POST /api/pantry/:id/waste
// @access  Private
export const markItemAsWasted = async (req, res, next) => {
  try {
    const item = await PantryItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pantry item not found',
      });
    }

    item.isWasted = true;
    item.wastedAt = new Date();
    await item.save();

    // Record monthly wasted stat
    const currentMonth = getMonthString();
    await WasteStat.findOneAndUpdate(
      { user: req.user._id, month: currentMonth },
      {
        $inc: {
          itemsWastedCount: 1,
          moneyWasted: item.estimatedPrice || 3.5,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Marked "${item.name}" as wasted.`,
      item,
    });
  } catch (error) {
    next(error);
  }
};
