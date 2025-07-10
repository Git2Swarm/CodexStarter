const express = require('express');
const cors = require('cors');
const fs = require('fs');
const yaml = require('js-yaml');
const app = express();

app.use(express.json());
app.use(cors());

// Load agent card from YAML
const agentCard = yaml.load(fs.readFileSync('./agent_card.yaml', 'utf8'));
// In-memory agent registry
const agents = [agentCard];

// List agents, optional search
app.get('/a2a/agents', (req, res) => {
  const q = (req.query.search || '').toLowerCase();
  const results = agents.filter(a => !q || a.name.toLowerCase().includes(q));
  res.json(results);
});

// Register a new agent using A2A card fields
app.post('/a2a/agents', (req, res) => {
  const { id, name, description, endpoint_url } = req.body;
  if (!id || !endpoint_url) return res.status(400).json({ error: 'Missing fields' });
  const agent = { id, name, description, endpoint_url };
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

// Provide agent card
app.get('/a2a/agents/:id/card', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`A2A agent server listening on port ${port}`);
});
