const express = require('express');
const cors = require('cors');
require('dotenv').config();

const superadminRoutes = require('./routes/superadminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/superadmin', superadminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PharmaLink Multi-Tenant SaaS Server API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 PHARMALINK SAAS BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🔑 SUPER-ADMIN LOGIN: username="rubyan", password="1234"`);
  console.log(`==================================================`);
});
