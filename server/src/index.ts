import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import productsRoutes from './routes/products.js';
import membersRoutes from './routes/members.js';
import messagesRoutes from './routes/messages.js';
import webhookRoutes from './routes/webhook.js';
import adminRoutes from './routes/admin.js';
import ordersRoutes from './routes/orders.js';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Webhook route needs raw body (before json parser)
app.use('/api/webhook', webhookRoutes);

// JSON parser for other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 L'ArtPéro API running on port ${PORT}`);
});
