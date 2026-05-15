import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ModuleKey } from '~/constants/moduleKeys';
import { getAccessContextByUserId } from '~/services/subscriptionAccess.service';

interface AuthRequest extends Request {
  user?: Express.Request['user'];
}

const attachUserContext = async (req: AuthRequest, userId: string) => {
  const accessContext = await getAccessContextByUserId(userId);
  if (!accessContext) {
    return null;
  }

  req.user = {
    id: accessContext.id,
    role: accessContext.role,
    status: accessContext.status,
    ownerId: accessContext.ownerId,
    accessibleModules: accessContext.accessibleModules,
    allowedModules: accessContext.allowedModules
  };

  return accessContext;
};

const forbidden = (res: Response, message = 'Forbidden') => res.status(403).json({ message });

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const accessContext = await attachUserContext(req, decoded.id);

    if (!accessContext) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (accessContext.status !== 'active') {
      return res.status(403).json({ message: 'User is not active' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const accessContext = await attachUserContext(req, decoded.id);

    if (!accessContext || accessContext.status !== 'active') {
      req.user = undefined;
    }

    next();
  } catch (error) {
    next();
  }
};

export const checkRole =
  (role: string) =>
  (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (req.user?.role === 'superadmin') {
      return next();
    }

    if (req.user?.role !== role) {
      return forbidden(res);
    }

    next();
  };

export const checkRoles =
  (roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (req.user?.role === 'superadmin') {
      return next();
    }

    if (!req.user?.role || !roles.includes(req.user.role)) {
      return forbidden(res);
    }

    next();
  };

export const requireModuleAccess =
  (moduleKey: ModuleKey) =>
  (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role === 'superadmin' || req.user.role === 'admin') {
      return next();
    }

    if (!req.user.accessibleModules.includes(moduleKey)) {
      return forbidden(res, 'Module access denied');
    }

    next();
  };

export const requireAnyModuleAccess =
  (moduleKeys: ModuleKey[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role === 'superadmin' || req.user.role === 'admin') {
      return next();
    }

    if (!moduleKeys.some((moduleKey) => req.user?.accessibleModules.includes(moduleKey))) {
      return forbidden(res, 'Module access denied');
    }

    next();
  };
