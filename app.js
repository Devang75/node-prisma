const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
const apiRoutes = require('./routes/api.route');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Routes
app.get('/', (_req, res) => {
  res.send({ message: 'Awesome it works 🐻' });
});

app.use('/api', apiRoutes);

// Error handling
app.use((_req, _res, next) => {
  next(createError.NotFound());
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).send({
    status,
    message: err.message,
  });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
