import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { signalRoutes } from './routes/signal.routes';
import { tokenRoutes } from './routes/token.routes';
import { feeRoutes } from './routes/fee.routes';
import { partnerRoutes } from './routes/partner.routes';
import { WebSocketManager } from './websocket/websocket.manager';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { config } from './utils/config';
import { BackgroundWorker } from './services/worker.service';
import { BagsService } from './services/bags.service';
import { RedisCache } from './services/redis.service';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Initialize services
const bagsService = new BagsService();
const redisCache = new RedisCache();
const wsManagerInstance = new WebSocketManager(wss);
const worker = new BackgroundWorker(bagsService, redisCache, wsManagerInstance);

// Start background polling
worker.start(30000); // 30s interval

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));
app.options('*', cors()); // Handle preflight for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Rate limiting (only in production)
if (config.NODE_ENV === 'production') {
  app.use('/api/', apiLimiter);
  logger.info('Rate limiting enabled');
}

// Routes
app.use('/api/signals', signalRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/partners', partnerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.NODE_ENV,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bags Signal API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      signals: '/api/signals',
      tokens: '/api/tokens',
      fees: '/api/fees',
      partners: '/api/partners',
      websocket: '/ws',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.PORT;

server.listen(PORT, () => {
  logger.info('Bags Signal API started', {
    port: PORT,
    environment: config.NODE_ENV,
    websocket: 'enabled',
    rateLimiting: config.NODE_ENV === 'production' ? 'enabled' : 'disabled',
  });
  console.log(`🚀 Bags Signal API running on port ${PORT}`);
  console.log(`📡 WebSocket server ready on /ws`);
  console.log(`🏥 Health check available at /health`);
});

export { wsManagerInstance as wsManager };
