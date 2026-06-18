import mongoose from 'mongoose';
import { syncSharedFieldValuesFromLog } from '../services/sharedFieldValue.service';
import ProductionLogModel from '../models/ProductionLogs.model';
import ActivitiesModel from '../models/Activities.model';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to DB');

  const productionLogId = '6a32d30c4c6d6ec79baed7b6'; // From user log
  const productionLog = await ProductionLogModel.findById(productionLogId);
  console.log('Log Data:', productionLog?.data);

  const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value);

  console.log('Is log data a plain object?', isPlainObject(productionLog?.data));

  const activityId = '6a0d353ea474db27c73d9dc2'; // From user log
  const activity = await ActivitiesModel.findById(activityId);
  console.log('Activity fields length:', activity?.fields?.length);
  
  if (productionLog && activity) {
    const farmObj = {
      _id: productionLog.farm_id,
      farm_type_id: '6916a59ddb0bb8b29005d36e'
    };

    console.log('Running sync manually...');
    try {
      await syncSharedFieldValuesFromLog({
        farm: farmObj,
        activity,
        book: { _id: productionLog.book_id },
        log: productionLog
      });
      console.log('Sync finished manually.');
    } catch (err) {
      console.error('Sync Error:', err);
    }
  }

  process.exit(0);
}

run();
