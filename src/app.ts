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
import productionReportRoutes from './routes/productionReport.route';
import farmRoutes from './routes/farm.route';
import serviceModuleRoutes from './routes/serviceModule.route';
import subscriptionPackageRoutes from './routes/subscriptionPackage.route';
import userSubscriptionRoutes from './routes/userSubscription.route';
import farmtypeConfigRoutes from './routes/farmtypeConfig.route';
import mapRoutes from './routes/map.route';
import cropCategoriesRoutes from './routes/cropCategories.route';
import InventoryLogRoutes from './routes/InventoryLog.route';
import inventoryMaterialRoutes from './routes/inventoryMaterial.route';
import inventoryStockRoutes from './routes/inventoryStock.route';
import inventoryConfigRoutes from './routes/inventoryConfig.route';
import fileRoutes from './routes/file.route';
import farmZoneRoutes from './routes/farmZone.route';
import farmDiagramRoutes from './routes/farmDiagram.route';
import workflowRoutes from './routes/workflow.route';
import systemConfigRoutes from './routes/systemConfig.route';
import traceabilityRoutes from './routes/traceability.route';
import marketPriceRoutes from './routes/marketPrice.routes';
import reportTemplateRoutes from './routes/reportTemplate.route';
import exportRoutes from './routes/export.route';
import articleRoutes from './routes/article.route';

const app: Express = express();
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 1000 // giới hạn 100 request/IP
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
app.use('/api/productionReport', productionReportRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/serviceModule', serviceModuleRoutes);
app.use('/api/subscriptionPackage', subscriptionPackageRoutes);
app.use('/api/userSubscription', userSubscriptionRoutes);
app.use('/api/farmtypeConfig', farmtypeConfigRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/crop', cropCategoriesRoutes);
app.use('/api/inventory', InventoryLogRoutes);
app.use('/api/inventory', inventoryMaterialRoutes);
app.use('/api/inventory', inventoryStockRoutes);
app.use('/api/inventory', inventoryConfigRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/farmZone', farmZoneRoutes);
app.use('/api/farm-diagram', farmDiagramRoutes);
app.use('/api/internal/workflows', workflowRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/system-config', systemConfigRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/market-price', marketPriceRoutes);
app.use('/api/report-template', reportTemplateRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/articles', articleRoutes);

export default app;
