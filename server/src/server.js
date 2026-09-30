import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './seed/seed.js';

import authRoutes from './routes/authRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import examRoutes from './routes/examRoutes.js';
import marksRoutes from './routes/marksRoutes.js';
import processingRoutes from './routes/processingRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import reEvaluationRoutes from './routes/reEvaluationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Generous rate limiter for local API use and CAPP benchmarking
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsers with capacity for large batch mark uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Digital EPS & CAPP Processing Engine',
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/processing', processingRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reevaluation', reEvaluationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Running auto-seeding with demo data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Digital EPS Server running on http://localhost:${PORT}`);
      console.log(`⚡ CAPP Parallel Processing Engine initialized`);
      console.log(`🛡️  RBAC & Audit Trail Active`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
