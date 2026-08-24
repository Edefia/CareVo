import mongoose from 'mongoose';
import { env } from '../config/env.js';

const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/carebis-prime';

async function clearBookings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    if (db) {
        await db.collection('bookings').drop().catch(() => console.log('Bookings collection does not exist or already dropped.'));
        console.log('✅ Bookings collection dropped.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearBookings();
