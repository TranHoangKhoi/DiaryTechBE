import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import ownerRoutes from './routes/owner.route';
import farmTypeRoutes from './routes/farmtype.route';
import activityRoutes from './routes/activity.route';
import productionBookRoutes from './routes/productionBook.route';
import productionLogsRoutes from './routes/productionLogs.route';
import farmRoutes from './routes/farm.route';
import serviceModuleRoutes from './routes/serviceModule.route';
import subscriptionPackageRoutes from './routes/subscriptionPackage.route';
import userSubscriptionRoutes from './routes/userSubscription.route';
import farmtypeConfigRoutes from './routes/farmtypeConfig.route';
import mapRoutes from './routes/map.route';

const app: Express = express();
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100 // giới hạn 100 request/IP
  })
);

// Routes
app.use('/api/checkHeath', (req, res) => {
  res.send('Server is running');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/farmtype', farmTypeRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/productionLogs', productionLogsRoutes);
app.use('/api/productionBook', productionBookRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/serviceModule', serviceModuleRoutes);
app.use('/api/subscriptionPackage', subscriptionPackageRoutes);
app.use('/api/userSubscription', userSubscriptionRoutes);
app.use('/api/farmtypeConfig', farmtypeConfigRoutes);
app.use('/api/map', mapRoutes);

export default app;
