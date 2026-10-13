import express from 'express';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import equipmentRoutes from './src/routes/equipment.routes.js';
import requestRoutes from './src/routes/request.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import siteRoutes from './src/routes/site.routes.js';

import cookieParser from 'cookie-parser';
import metricsMiddleware from './src/middlewares/metrics.middleware.js';
import requestId from './src/middlewares/requestId.middleware.js';
import logger from './src/middlewares/logger.middleware.js';
import security from './src/middlewares/security.middleware.js';
import corsMiddleware from './src/middlewares/cors.middleware.js';
import rateLimit from './src/middlewares/rateLimit.middleware.js';
import metricsRoutes from './src/routes/metrics.routes.js';
import { notFound } from './src/middlewares/notFound.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import healthRoutes from './src/routes/health.routes.js';

const app = express();
app.set('trust proxy', 1);

app.use(requestId);
app.use(metricsMiddleware);
app.use(logger);
app.use(security);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(rateLimit);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Maintenance Service API is running',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use('/metrics', metricsRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
