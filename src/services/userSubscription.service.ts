import { ClientSession } from 'mongoose';
import ServiceModuleModel from '~/models/ServiceModule.model';
import SubscriptionPackageModel from '~/models/SubscriptionPackage.model';
import UserModel from '~/models/User.model';
import UserSubscriptionModel from '~/models/UserSubscription.model';
import { MODULE_KEYS } from '~/constants/moduleKeys';

const FARM_DIARY_MODULE_KEYS = [MODULE_KEYS.farmDiary, 'diary'];

type CreateOwnerSubscriptionInput = {
  user_id: string;
  module_id: string;
  package_id: string;
  assigned_by: string;
  custom_limits?: {
    max_sub_accounts?: number;
  };
  session?: ClientSession;
};

export const createOwnerSubscription = async ({
  user_id,
  module_id,
  package_id,
  assigned_by,
  custom_limits,
  session
}: CreateOwnerSubscriptionInput) => {
  const [user, module, pkg] = await Promise.all([
    UserModel.findById(user_id).select('_id role status').session(session || null),
    ServiceModuleModel.findById(module_id).select('_id key is_active').session(session || null),
    SubscriptionPackageModel.findById(package_id)
      .select('_id module_id code name max_sub_accounts price_per_month duration_in_days is_active')
      .session(session || null)
  ]);

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  if (user.role !== 'owner') {
    throw Object.assign(new Error('Only owner can receive module subscriptions.'), { statusCode: 400 });
  }

  if (user.status !== 'active') {
    throw Object.assign(new Error('Owner is not active.'), { statusCode: 400 });
  }

  if (!module || !module.is_active) {
    throw Object.assign(new Error('Module not found or inactive.'), { statusCode: 404 });
  }

  if (!pkg || pkg.is_active === false) {
    throw Object.assign(new Error('Subscription package not found or inactive.'), { statusCode: 404 });
  }

  if (String(pkg.module_id) !== module_id) {
    throw Object.assign(new Error('package_id does not belong to the selected module.'), { statusCode: 400 });
  }

  const now = new Date();
  await UserSubscriptionModel.updateMany(
    {
      user_id,
      module_id,
      status: 'active',
      end_date: { $lte: now }
    },
    {
      $set: {
        status: 'expired'
      }
    },
    { session }
  );

  const existingActive = await UserSubscriptionModel.findOne({
    user_id,
    module_id,
    status: 'active',
    end_date: { $gt: now }
  })
    .select('_id')
    .session(session || null);

  if (existingActive) {
    throw Object.assign(new Error('Owner already has an active subscription for this module.'), { statusCode: 409 });
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + pkg.duration_in_days);
  const isFarmDiaryModule = FARM_DIARY_MODULE_KEYS.includes(module.key);
  const maxSubAccounts =
    isFarmDiaryModule && typeof custom_limits?.max_sub_accounts === 'number'
      ? custom_limits.max_sub_accounts
      : pkg.max_sub_accounts;

  const [newSub] = await UserSubscriptionModel.create(
    [
      {
        user_id,
        module_id,
        package_id,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        max_sub_accounts: maxSubAccounts,
        remaining_sub_accounts: maxSubAccounts,
        module_config: isFarmDiaryModule
          ? {
              farm_diary: {
                max_sub_accounts: maxSubAccounts
              }
            }
          : undefined,
        assigned_by,
        activated_at: startDate
      }
    ],
    { session }
  );

  await newSub.populate('module_id', 'key name');
  await newSub.populate('package_id', 'code name max_sub_accounts duration_in_days');
  await newSub.populate('assigned_by', 'name phone role');

  return newSub;
};
