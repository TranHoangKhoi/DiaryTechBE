import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import MapFeatureModel from '../src/models/MapFeature.model';
import MapTenantModel from '../src/models/MapTenant.model';
import { seedDatDoAssistantContents } from './datDoAssistantSeed';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const seed = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected DB');

  const datDoTenant = await MapTenantModel.findOne({
    slug: 'dat-do',
    status: 'active'
  });

  if (!datDoTenant) {
    throw new Error('Map tenant dat-do not found');
  }

  const hamletFeatures = await MapFeatureModel.find({
    tenant_id: datDoTenant._id,
    feature_type: 'hamlet',
    is_active: true,
    status: 'active'
  }).lean();

  const result = await seedDatDoAssistantContents(datDoTenant._id as mongoose.Types.ObjectId, hamletFeatures, {
    forceContent: process.argv.includes('--force')
  });

  console.log('Seed map assistant contents done', result);
};

seed()
  .catch((error) => {
    console.error('Seed map assistant contents failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
