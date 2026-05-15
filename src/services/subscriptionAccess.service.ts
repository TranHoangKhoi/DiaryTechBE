import mongoose from 'mongoose';
import UserModel, { IUser } from '~/models/User.model';
import UserSubscriptionModel from '~/models/UserSubscription.model';
import { MODULE_KEY_VALUES, ModuleKey } from '~/constants/moduleKeys';

type AccessContext = {
  id: string;
  role: IUser['role'];
  status: IUser['status'];
  ownerId?: string;
  accessibleModules: ModuleKey[];
  allowedModules?: ModuleKey[];
};

type AccessUserRecord = {
  _id: mongoose.Types.ObjectId;
  role: IUser['role'];
  status: IUser['status'];
  owner_id?: mongoose.Types.ObjectId;
  allowed_modules?: ModuleKey[];
};

const moduleKeySet = new Set<string>(MODULE_KEY_VALUES);

const toModuleKey = (value: unknown): ModuleKey | null => {
  if (typeof value !== 'string' || !moduleKeySet.has(value)) {
    return null;
  }

  return value as ModuleKey;
};

const uniqueModuleKeys = (values: unknown[]): ModuleKey[] => {
  return [...new Set(values.map((value) => toModuleKey(value)).filter((value): value is ModuleKey => Boolean(value)))];
};

const getOwnerIdFromUser = (user: AccessUserRecord) => {
  if (user.role === 'sub_account') {
    return user.owner_id ? user.owner_id.toString() : undefined;
  }

  return user._id.toString();
};

export const getActiveModuleKeysByOwnerId = async (ownerId: string, now = new Date()): Promise<ModuleKey[]> => {
  const subscriptions = await UserSubscriptionModel.find({
    user_id: ownerId,
    status: 'active',
    start_date: { $lte: now },
    end_date: { $gt: now }
  })
    .populate('module_id', 'key is_active')
    .lean();

  const moduleKeys = subscriptions
    .map((subscription: any) => {
      const module = subscription.module_id;
      if (!module || module.is_active !== true) return null;
      return toModuleKey(module.key);
    })
    .filter((value): value is ModuleKey => Boolean(value));

  return [...new Set(moduleKeys)];
};

export const getAccessContextByUserId = async (userId: string, now = new Date()): Promise<AccessContext | null> => {
  const user = await UserModel.findById(userId)
    .select('_id role status owner_id allowed_modules')
    .lean<AccessUserRecord | null>();

  if (!user) return null;

  const ownerId = getOwnerIdFromUser(user);
  const allowedModules = uniqueModuleKeys(user.allowed_modules ?? []);

  if (user.role === 'superadmin' || user.role === 'admin') {
    return {
      id: user._id.toString(),
      role: user.role,
      status: user.status,
      ownerId,
      accessibleModules: [...MODULE_KEY_VALUES],
      allowedModules
    };
  }

  if (!ownerId) {
    return {
      id: user._id.toString(),
      role: user.role,
      status: user.status,
      accessibleModules: [],
      allowedModules
    };
  }

  const ownerModules = await getActiveModuleKeysByOwnerId(ownerId, now);
  const accessibleModules =
    user.role === 'sub_account' && allowedModules.length > 0
      ? ownerModules.filter((moduleKey) => allowedModules.includes(moduleKey))
      : ownerModules;

  return {
    id: user._id.toString(),
    role: user.role,
    status: user.status,
    ownerId,
    accessibleModules,
    allowedModules
  };
};

export const getVisibleSubscriptionsByUserId = async (userId: string, now = new Date()) => {
  const accessContext = await getAccessContextByUserId(userId, now);
  if (!accessContext?.ownerId) return [];

  const subscriptions = await UserSubscriptionModel.find({
    user_id: accessContext.ownerId,
    status: 'active',
    start_date: { $lte: now },
    end_date: { $gt: now }
  })
    .populate('module_id', 'key name description is_active')
    .populate('package_id', 'code name max_sub_accounts price_per_month duration_in_days is_active')
    .lean();

  return subscriptions.filter((subscription: any) => {
    const moduleKey = toModuleKey(subscription?.module_id?.key);
    return moduleKey ? accessContext.accessibleModules.includes(moduleKey) : false;
  });
};

export const isAllowedModuleSubset = (allowedModules: unknown[], ownerModules: ModuleKey[]) => {
  const normalizedAllowedModules = uniqueModuleKeys(allowedModules);
  return normalizedAllowedModules.every((moduleKey) => ownerModules.includes(moduleKey));
};

export const normalizeAllowedModules = (allowedModules: unknown[]) => uniqueModuleKeys(allowedModules);
