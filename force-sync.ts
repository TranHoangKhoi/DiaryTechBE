import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });
import connectDB from './src/config/db';
import { scrapeTepbacPrices } from './src/services/crawler.service';

const run = async () => {
  await connectDB();
  await scrapeTepbacPrices();
  console.log('Done!');
  process.exit(0);
};

run().catch(console.error);
