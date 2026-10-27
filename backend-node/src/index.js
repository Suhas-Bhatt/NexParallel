// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const authMiddleware = require('./middleware/auth');

// Routers
const simulateRouter = require('./routes/simulate');
const simulationRouter = require('./routes/simulation');
const historyRouter = require('./routes/history');
const reportRouter = require('./routes/report');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(authMiddleware); // protect all routes

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mount routes
app.use('/simulate', simulateRouter);
app.use('/simulation', simulationRouter);
app.use('/history', historyRouter);
app.use('/report', reportRouter);

// Global error handler
const errorHandler = require('./utils/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Express server listening on port ${PORT}`);
});

module.exports = app; // for testing
