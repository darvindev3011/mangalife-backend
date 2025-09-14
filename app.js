import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { sequelize } from './models/index.js';
import apiRoutes from './routes/index.js';
import proxyImageRouter from './routes/image-proxy.js';

const app = express();
// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(bodyParser.json());

// API route
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('MangaLife Backend is running');
});

// proxy-image route
// This route is used to proxy images from external sources
app.use("/proxy-image", proxyImageRouter);

// Start server after DB connection
sequelize.authenticate()
  .then(() => {
    console.log('Connected to Postgres database');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
