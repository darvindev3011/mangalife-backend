
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./models');
const apiRoutes = require('./routes/index');
const proxyImageRouter = require('./routes/image-proxy');

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
