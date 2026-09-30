import mongoose from 'mongoose';

const wasteStatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: String, // Format: YYYY-MM
      required: true,
      index: true,
    },
    itemsSavedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    itemsWastedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    moneySaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    moneyWasted: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

wasteStatSchema.index({ user: 1, month: 1 }, { unique: true });

export const WasteStat = mongoose.model('WasteStat', wasteStatSchema);
export default WasteStat;
