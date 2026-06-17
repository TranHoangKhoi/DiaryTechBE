import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Need to load environment variables for MongoDB URI
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diarytech';

async function test() {
  await mongoose.connect(MONGODB_URI);
  
  // Try to find the FarmZone user mentioned
  const db = mongoose.connection.db;
  if (!db) return;
  
  const farmZones = await db.collection('farmzones').find({ farm_id: new mongoose.Types.ObjectId("69b8cecb0380924d811f07e2") }).toArray();
  console.log("FarmZones using ObjectId:", farmZones.length);

  const farmZonesString = await db.collection('farmzones').find({ farm_id: "69b8cecb0380924d811f07e2" }).toArray();
  console.log("FarmZones using String:", farmZonesString.length);

  const farmZonesAny = await db.collection('farmzones').find({}).limit(5).toArray();
  console.log("Sample farmzone farm_id types:", farmZonesAny.map(fz => typeof fz.farm_id + " - " + (fz.farm_id instanceof mongoose.Types.ObjectId ? "ObjectId" : "")));

  await mongoose.disconnect();
}

test().catch(console.error);
