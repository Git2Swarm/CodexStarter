const API_BASE_URL = 'http://localhost:3000/a2a';

async function searchAgents() {
  const query = document.getElementById('search').value;
  const res = await fetch(`${API_BASE_URL}/agents?search=${encodeURIComponent(query)}`);
  if (!res.ok) {
    alert('Error searching agents');
    return;
  }
  const agents = await res.json();
  displayAgents(agents);
}

function displayAgents(agents) {
  const results = document.getElementById('results');
  results.innerHTML = '';
  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.innerHTML = `
      <h3>${agent.name}</h3>
      <p>${agent.description || ''}</p>
      <button onclick="queryAgent('${agent.id}')">Query</button>
      <button onclick="buyAgent('${agent.id}')">Buy</button>
    `;
    results.appendChild(card);
  });
}

async function registerAgent() {
  const name = document.getElementById('agent-name').value;
  const description = document.getElementById('agent-description').value;
  const endpoint = document.getElementById('agent-endpoint').value;
  const data = { name, description, endpoint };
  const res = await fetch(`${API_BASE_URL}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    alert('Agent registered');
  } else {
    alert('Registration failed');
  }
}

async function queryAgent(agentId) {
  const question = prompt('Enter a query for the agent:');
  if (!question) return;
  const res = await fetch(`${API_BASE_URL}/agents/${agentId}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question })
  });
  if (!res.ok) {
    alert('Query failed');
    return;
  }
  const result = await res.json();
  alert(result.answer || JSON.stringify(result));
}

function buyAgent(agentId) {
  // Expect the API to return a Stripe checkout URL
  fetch(`${API_BASE_URL}/agents/${agentId}/buy`).then(res => res.json()).then(data => {
    if (data.checkoutUrl) {
      window.location = data.checkoutUrl;
    } else {
      alert('Checkout link not available');
    }
  });
}
document.addEventListener('DOMContentLoaded', searchAgents);
