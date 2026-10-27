import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { sendTestEmail } from '../services/emailService.js';
import { checkAndDispatchReminders } from '../jobs/reminderJob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const users = await User.find({});
    console.log(`Found ${users.length} total users.`);

    console.log(`Base URL from CLIENT_URL: ${process.env.CLIENT_URL}`);

    console.log('\n--- Sending Test Emails with Live URL ---');
    for (const user of users) {
      if (!user.email) {
        console.log(`Skipping user ${user.name} (no email)`);
        continue;
      }
      console.log(`Sending test email to ${user.name} (${user.email})...`);
      const res = await sendTestEmail({
        to: user.email,
        userName: user.name,
      });
      console.log(`Result for ${user.email}:`, res.success ? 'SUCCESS' : `FAILED (${res.error})`);
    }

    console.log('\n--- Running checkAndDispatchReminders ---');
    await checkAndDispatchReminders();

    console.log('\nFinished sending test notifications.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
