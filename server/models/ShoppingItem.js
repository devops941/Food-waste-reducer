import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    quantity: {
      type: String,
      default: '1',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ShoppingItem = mongoose.model('ShoppingItem', shoppingItemSchema);
export default ShoppingItem;
