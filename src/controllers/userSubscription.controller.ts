import { Request, Response } from 'express';
import { z } from 'zod';
import UserSubscriptionModel from '~/models/UserSubscription.model';
import UserModel from '~/models/User.model';
import SubscriptionPackageModel from '~/models/SubscriptionPackage.model';
import ServiceModuleModel from '~/models/ServiceModule.model';

const createUserSubscriptionSchema = z.object({
  user_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  module_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  package_id: z.string().regex(/^[0-9a-fA-F]{24}$/)
});

export const createUserSubscription = async (req: Request, res: Response) => {
  try {
    const { user_id, module_id, package_id } = createUserSubscriptionSchema.parse(req.body);

    const [user, module, pkg] = await Promise.all([
      UserModel.findById(user_id).select('_id role status'),
      ServiceModuleModel.findById(module_id).select('_id key is_active'),
      SubscriptionPackageModel.findById(package_id).select(
        '_id module_id code name max_sub_accounts price_per_month duration_in_days is_active'
      )
    ]);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.role !== 'owner') {
      res.status(400).json({ success: false, message: 'Only owner can receive module subscriptions.' });
      return;
    }

    if (user.status !== 'active') {
      res.status(400).json({ success: false, message: 'Owner is not active.' });
      return;
    }

    if (!module || !module.is_active) {
      res.status(404).json({ success: false, message: 'Module not found or inactive.' });
      return;
    }

    if (!pkg || !pkg.is_active) {
      res.status(404).json({ success: false, message: 'Subscription package not found or inactive.' });
      return;
    }

    if (String(pkg.module_id) !== module_id) {
      res.status(400).json({ success: false, message: 'package_id does not belong to the selected module.' });
      return;
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
      }
    );

    const existingActive = await UserSubscriptionModel.findOne({
      user_id,
      module_id,
      status: 'active',
      end_date: { $gt: now }
    }).select('_id');

    if (existingActive) {
      res.status(409).json({
        success: false,
        message: 'Owner already has an active subscription for this module.'
      });
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.duration_in_days);

    const newSub = await UserSubscriptionModel.create({
      user_id,
      module_id,
      package_id,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
      remaining_sub_accounts: pkg.max_sub_accounts,
      assigned_by: req.user?.id,
      activated_at: startDate
    });

    await newSub.populate('module_id', 'key name');
    await newSub.populate('package_id', 'code name max_sub_accounts duration_in_days');
    await newSub.populate('assigned_by', 'name phone role');

    res.status(201).json({
      success: true,
      message: 'User subscription created successfully.',
      data: newSub
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid request payload.',
        errors: error.errors
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user subscription.'
    });
  }
};
