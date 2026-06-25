import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';

// dotenv.config();
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });

const PORT: number = Number(process.env.PORT) || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to DB:', error);
    process.exit(1);
  });
