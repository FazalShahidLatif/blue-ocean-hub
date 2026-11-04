import express from 'express';

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Google Indexing status endpoint
app.get('/api/google-indexing/status', (req, res) => {
  res.json({ status: 'ready', message: 'Indexing API available' });
});

export default app;
