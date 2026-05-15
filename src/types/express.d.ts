import { ModuleKey } from '~/constants/moduleKeys';

declare namespace Express {
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
