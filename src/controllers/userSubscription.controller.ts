import { Request, Response } from 'express';
import { z } from 'zod';
import { createOwnerSubscription } from '~/services/userSubscription.service';

const createUserSubscriptionSchema = z.object({
  user_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  module_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  package_id: z.string().regex(/^[0-9a-fA-F]{24}$/)
});

export const createUserSubscription = async (req: Request, res: Response) => {
  try {
    const { user_id, module_id, package_id } = createUserSubscriptionSchema.parse(req.body);

    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const newSub = await createOwnerSubscription({
      user_id,
      module_id,
      package_id,
      assigned_by: req.user.id
    });

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

    const statusCode =
      error instanceof Error && 'statusCode' in error ? Number((error as { statusCode: number }).statusCode) : 500;
    if (statusCode !== 500) {
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user subscription.'
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
