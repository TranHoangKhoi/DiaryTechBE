import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Bạn chưa đăng nhập, hoặc không đủ quyền thực hiện !' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, we still allow the request but without req.user
    next();
  }
};

export const checkRole =
  (role: string) =>
  (req: AuthRequest, res: Response, next: NextFunction): any => {
    // Nếu là superadmin thì bỏ qua check
    if (req.user?.role === 'superadmin') {
      return next();
    }

    // Nếu không phải role yêu cầu thì cấm
    if (req.user?.role !== role) {
      console.log('req.user?.role: ', req.user?.role);

      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
