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
import productionLogsRoutes from './routes/productionLogs.route';

const app: Express = express();

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

export default app;
