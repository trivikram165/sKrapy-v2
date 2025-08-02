const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Drop all existing indexes except _id
    console.log('Dropping existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`Could not drop index ${index.name}:`, error.message);
        }
      }
    }

    // Create the new compound index
    console.log('Creating compound index for clerkId + role...');
    await collection.createIndex({ clerkId: 1, role: 1 }, { unique: true });
    console.log('Compound index created successfully');

    // Verify the new indexes
    const newIndexes = await collection.indexes();
    console.log('New indexes:', newIndexes);

    console.log('Database indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
