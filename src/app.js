const express = require('express');
const app = express();
//const swaggerUi = require("swagger-ui-express");
//const swaggerFile = require("../swagger-output.json");

const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/error-handler');

app.use(express.json());

// Routes
app.use('/reviews', require('./routes/reviews.routes'));

// 404
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.originalUrl}`);
  const err = new Error('Endpoint not found');
  err.statusCode = 404;
  next(err);
});

// Error handler
app.use(errorHandler);

module.exports = app;