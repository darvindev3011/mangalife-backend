import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { sequelize } from './models/index.js';
import apiRoutes from './routes/index.js';
import proxyImageRouter from './routes/image-proxy.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.FRONTEND_URLS
      ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
      : [];
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
