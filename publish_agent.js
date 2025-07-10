#!/usr/bin/env node
const { readFile, writeFile, mkdir } = require('fs').promises;
const yaml = require('js-yaml');

async function main() {
  const card = yaml.load(await readFile('agent_card.yaml', 'utf8'));

  const prompts = [
    'What is your purpose?',
    'What types of users benefit most from using you?',
    'Show an example greeting in English.',
    'Show an example greeting in Spanish.',
    'What are your limitations?',
    'What happens if I send an invalid input?',
    'How should a developer integrate you?'
  ];

  const qa = [];
  for (const question of prompts) {
    try {
      const resp = await fetch(card.endpoint_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question })
      });
      const data = await resp.json();
      qa.push({ question, response: data.answer || JSON.stringify(data) });
    } catch (err) {
      qa.push({ question, response: `Error: ${err.message}` });
    }
  }

  const dir = `agents/${card.id}`;
  await mkdir(dir, { recursive: true });

  await writeFile(`${dir}/answers.json`, JSON.stringify({ id: card.id, qa }, null, 2));

  const metadata = {
    id: card.id,
    name: card.name,
    description: card.description,
    url: `agents/${card.id}/index.html`,
    tags: card.tags
  };
  await writeFile(`${dir}/metadata.json`, JSON.stringify(metadata, null, 2));
  await writeFile(`${dir}/sitemap.json`, JSON.stringify({ pages: [metadata.url] }, null, 2));

  // update marketplace index
  let index = [];
  try {
    index = JSON.parse(await readFile('marketplace_index.json', 'utf8'));
  } catch {}
  const existing = index.find(i => i.id === metadata.id);
  if (!existing) index.push(metadata);
  await writeFile('marketplace_index.json', JSON.stringify(index, null, 2));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${card.name}</title>
  <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/tailwindcss-jit-cdn"></script>
  <script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: card.name,
    applicationCategory: 'Conversational AI',
    description: card.description,
    url: `https://agents.yourdomain.com/${card.id}`,
    sameAs: `https://marketplace.yourdomain.com/agents/${card.id}`,
    programmingLanguage: 'English',
    softwareVersion: card.version,
    operatingSystem: 'All',
    author: { '@type': 'Organization', name: 'HelloAgents.ai' }
  }, null, 2)}
  </script>
</head>
<body class="p-4 font-sans">
  <div id="root"></div>
  <script>
    const card = ${JSON.stringify(card)};
    async function fetchQA() {
      const res = await fetch('answers.json');
      return res.json();
    }
    const prompts = ${JSON.stringify(prompts)};
    function App() {
      const [qa, setQA] = React.useState([]);
      React.useEffect(() => { fetchQA().then(data => setQA(data.qa)); }, []);
      return React.createElement('div', { className: 'max-w-2xl mx-auto' }, [
        React.createElement('h1', { className: 'text-3xl font-bold mb-2' }, card.name),
        React.createElement('p', { className: 'mb-4' }, card.description),
        React.createElement('h2', { className: 'text-xl font-semibold mt-4 mb-2' }, 'What this Agent Does'),
        React.createElement('p', {}, qa.find(q => q.question === prompts[0])?.response || ''),
        React.createElement('h2', { className: 'text-xl font-semibold mt-4 mb-2' }, 'Sample Conversations'),
        ...qa.slice(2,4).map((item, i) => React.createElement('div', { key: i, className: 'mb-2' }, [
          React.createElement('p', { className: 'font-semibold' }, item.question),
          React.createElement('p', {}, item.response)
        ])),
        React.createElement('h2', { className: 'text-xl font-semibold mt-4 mb-2' }, 'How to Use It'),
        React.createElement('p', {}, qa[6]?.response || ''),
        React.createElement('h2', { className: 'text-xl font-semibold mt-4 mb-2' }, 'Limitations'),
        React.createElement('p', {}, qa[4]?.response || ''),
        React.createElement('h2', { className: 'text-xl font-semibold mt-4 mb-2' }, 'Developer Setup'),
        React.createElement('pre', { className: 'bg-gray-100 p-2' }, JSON.stringify(card.input_spec, null, 2) + '\n' + JSON.stringify(card.output_spec, null, 2)),
        React.createElement('a', { href: '../../index.html', className: 'text-blue-500 underline mt-4 block' }, 'Back to Marketplace')
      ]);
    }
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  </script>
</body>
</html>`;

  await writeFile(`${dir}/index.html`, html);
}

main();
