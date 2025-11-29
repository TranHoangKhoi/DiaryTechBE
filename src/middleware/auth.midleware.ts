import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
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
