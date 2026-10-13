
import express from 'express';

const app = express();

app.use(express.json({ limit: '10kb' }));

// Temporary in-memory collection of projects.
const projects = [];

// Health-check route.
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Return all projects as JSON.
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// Serve the existing frontend.
app.use(express.static('public'));

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});
