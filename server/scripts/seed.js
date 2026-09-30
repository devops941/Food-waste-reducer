import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import PantryItem from '../models/PantryItem.js';
import WasteStat from '../models/WasteStat.js';

dotenv.config();

const sampleItems = [
  {
    name: 'Fresh Spinach',
    quantity: '1 bag (200g)',
    category: 'Produce',
    daysToAdd: 1,
    estimatedPrice: 3.20,
    notes: 'In crisper drawer, use for salad or omelette',
  },
  {
    name: 'Greek Plain Yogurt',
    quantity: '500g tub',
    category: 'Dairy',
    daysToAdd: 2,
    estimatedPrice: 4.50,
    notes: 'Unopened, top shelf',
  },
  {
    name: 'Artisan Sourdough Bread',
    quantity: 'Half loaf (4 slices)',
    category: 'Bakery',
    daysToAdd: 2,
    estimatedPrice: 5.00,
    notes: 'Good for French toast or toasties',
  },
  {
    name: 'Ripe Avocados',
    quantity: '2 whole',
    category: 'Produce',
    daysToAdd: 3,
    estimatedPrice: 3.80,
    notes: 'Ready to eat today or tomorrow',
  },
  {
    name: 'Chicken Breast Fillets',
    quantity: '400g pack',
    category: 'Meat & Poultry',
    daysToAdd: 3,
    estimatedPrice: 7.50,
    notes: 'Middle fridge shelf, cook soon or freeze',
  },
  {
    name: 'Fresh Strawberries',
    quantity: '1 punnet (250g)',
    category: 'Produce',
    daysToAdd: 4,
    estimatedPrice: 4.20,
    notes: 'Sweet and fragrant, great for breakfast bowls',
  },
  {
    name: 'Almond Milk (Unsweetened)',
    quantity: '1 carton (1L)',
    category: 'Dairy',
    daysToAdd: 6,
    estimatedPrice: 3.50,
    notes: 'Opened 3 days ago',
  },
  {
    name: 'Cheddar Cheese Block',
    quantity: '250g',
    category: 'Dairy',
    daysToAdd: 10,
    estimatedPrice: 4.80,
    notes: 'Sealed wrapper',
  },
  {
    name: 'Canned Chickpeas',
    quantity: '2 cans (400g each)',
    category: 'Pantry & Grains',
    daysToAdd: 45,
    estimatedPrice: 2.40,
    notes: 'Pantry top shelf',
  },
  {
    name: 'Jasmine Rice',
    quantity: '1 kg bag',
    category: 'Pantry & Grains',
    daysToAdd: 90,
    estimatedPrice: 4.00,
    notes: 'Dry storage container',
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // Create or find default demo user
    let demoUser = await User.findOne({ email: 'demo@pantryfresh.app' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Emma Green',
        email: 'demo@pantryfresh.app',
        password: 'password123',
        phone: '+1234567890',
        dietaryPreferences: [],
        reminderSettings: {
          emailEnabled: true,
          whatsappEnabled: true,
          daysBeforeExpiry: 2,
        },
      });
      console.log('[Seed] Created demo user: demo@pantryfresh.app (password: password123)');
    } else {
      console.log('[Seed] Found existing demo user');
    }

    // Clear previous pantry items for this user
    await PantryItem.deleteMany({ user: demoUser._id });

    // Insert 10 sample items
    const now = new Date();
    const itemsToInsert = sampleItems.map((item) => {
      const expiry = new Date();
      expiry.setDate(now.getDate() + item.daysToAdd);
      return {
        user: demoUser._id,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        expiryDate: expiry,
        estimatedPrice: item.estimatedPrice,
        notes: item.notes,
      };
    });

    await PantryItem.insertMany(itemsToInsert);
    console.log(`[Seed] Successfully inserted ${itemsToInsert.length} pantry items!`);

    // Add initial monthly stats
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await WasteStat.findOneAndUpdate(
      { user: demoUser._id, month: currentMonth },
      {
        user: demoUser._id,
        month: currentMonth,
        itemsSavedCount: 14,
        itemsWastedCount: 2,
        moneySaved: 52.50,
        moneyWasted: 6.80,
      },
      { upsert: true }
    );
    console.log('[Seed] Initialized monthly waste stats');

    console.log('\n--- Seed Complete ---');
    console.log('Login credentials:');
    console.log('Email: demo@pantryfresh.app');
    console.log('Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
