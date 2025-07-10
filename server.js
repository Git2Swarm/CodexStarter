const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// In-memory agent registry
const agents = [
  {
    id: 'helloworld',
    name: 'Hello World Agent',
    description: 'Simple agent that responds with a greeting.',
    endpoint: 'http://localhost:3000/helloworld'
  }
];

// List agents, optional search
app.get('/a2a/agents', (req, res) => {
  const q = (req.query.search || '').toLowerCase();
  const results = agents.filter(a => !q || a.name.toLowerCase().includes(q));
  res.json(results);
});

// Register a new agent
app.post('/a2a/agents', (req, res) => {
  const { name, description, endpoint } = req.body;
  if (!name || !endpoint) return res.status(400).json({ error: 'Missing fields' });
  const id = name.toLowerCase().replace(/\s+/g, '-');
  const agent = { id, name, description, endpoint };
  agents.push(agent);
  res.status(201).json(agent);
});

// Query an agent
app.post('/a2a/agents/:id/query', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const { query } = req.body;
  // Simple hello world response
  res.json({ answer: `Hello world! You asked: ${query}` });
});

// Simple hello world endpoint
app.get('/helloworld', (req, res) => {
  res.json({ message: 'Hello world!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`A2A agent server listening on port ${port}`);
});
