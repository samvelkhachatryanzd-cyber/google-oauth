require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./router');
const { sequelize } = require('./models');
const { notFound, errorHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set to a random string of at least 32 characters (see .env.example).');
  process.exit(1);
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('GOOGLE_CLIENT_ID must be set to the OAuth client id from Google Cloud Console (see .env.example).');
  process.exit(1);
}

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// The frontend reaches this API through the Vite dev proxy (same origin), so no CORS is needed.
app.use('/api/auth', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
}

startServer();
