import mongoose from 'mongoose';

const pantryItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide the item name'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    quantity: {
      type: String,
      default: '1 item',
      trim: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      default: 'Produce',
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify an expiration date'],
      index: true,
    },
    estimatedPrice: {
      type: Number,
      default: 3.5, // Default item value for savings calculation
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    isWasted: {
      type: Boolean,
      default: false,
      index: true,
    },
    usedAt: {
      type: Date,
    },
    wastedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to compute status dynamically
pantryItemSchema.virtual('status').get(function () {
  if (this.isUsed) return 'used';
  if (this.isWasted) return 'wasted';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(this.expiryDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) return 'expired';
  if (days <= 3) return 'soon';
  return 'fresh';
});

// Virtual field for days remaining
pantryItemSchema.virtual('daysRemaining').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(this.expiryDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export const PantryItem = mongoose.model('PantryItem', pantryItemSchema);
export default PantryItem;
