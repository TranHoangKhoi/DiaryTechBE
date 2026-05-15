import type { ModuleKey } from './constants/moduleKeys';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        status: string;
        ownerId?: string;
        accessibleModules: ModuleKey[];
        allowedModules?: ModuleKey[];
      };
    }
  }
}

export {};
