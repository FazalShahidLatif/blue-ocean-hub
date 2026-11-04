export default function handler(req, res) {
  if (req.url === '/api/health' || req.url === '/api/health/') {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    return;
  }
  if (req.url === '/api/google-indexing/status' || req.url === '/api/google-indexing/status/') {
    res.status(200).json({ status: 'ready', message: 'Indexing API available' });
    return;
  }
  res.status(404).json({ error: 'Not found' });
}
