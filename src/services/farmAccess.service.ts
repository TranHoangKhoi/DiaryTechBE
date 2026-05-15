import { Types } from 'mongoose';
import FarmModel from '~/models/Farm.model';

type UserContext = NonNullable<Express.Request['user']>;

export const getFarmAccessCondition = (user?: UserContext | undefined) => {
  if (!user) return null;
  if (user.role === 'superadmin' || user.role === 'admin') return {};
  if (user.role === 'owner') return { owner_id: user.id };
  if (user.role === 'sub_account') return { user_id: user.id, owner_id: user.ownerId };
  return null;
};

export const assertFarmAccess = async (user: UserContext | undefined, farmId: string) => {
  if (!user) {
    return { ok: false as const, status: 401, message: 'Unauthorized' };
  }

  if (!Types.ObjectId.isValid(farmId)) {
    return { ok: false as const, status: 400, message: 'Invalid farmId' };
  }

  const accessCondition = getFarmAccessCondition(user);
  if (!accessCondition) {
    return { ok: false as const, status: 403, message: 'Forbidden' };
  }

  const farm = await FarmModel.findOne({ _id: farmId, ...accessCondition }).select('_id owner_id user_id farm_type_id');
  if (!farm) {
    return { ok: false as const, status: 403, message: 'You do not have access to this farm' };
  }

  return { ok: true as const, farm };
};
