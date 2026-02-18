import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import sessionRoutes from './routes/sessionRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import authRoutes from './routes/authRoutes.js';
import seatingRoutes from './routes/seatingRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import adminMenuRoutes from './routes/adminMenuRoutes.js';
import adminRestaurantRoutes from './routes/adminRestaurantRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/sessions', sessionRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/seating', seatingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/menu', adminMenuRoutes);
app.use('/api/admin', adminRestaurantRoutes);
app.use('/api/admin', adminOrderRoutes);
app.use('/api/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
});
