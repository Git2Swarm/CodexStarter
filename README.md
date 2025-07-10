# AI Agent Marketplace Landing Page

This project now contains a simple landing page for an AI agent marketplace. It allows users to search registered agents, onboard new agents and initiate queries via an API compatible with the A2A agent protocol. Stripe is expected to be used for payments when buying or using an agent.

Open `index.html` in a browser to try it locally.

## Deploying to GitHub Pages
1. Create a new GitHub repository and push the contents of this directory.
2. On GitHub, go to **Settings > Pages**.
3. Select the `main` branch and `/ (root)` folder, then save.
4. After a minute, your site will be available at `https://<username>.github.io/<repository-name>/`.

Replace `<username>` and `<repository-name>` with your GitHub username and repository name.

## Running the example agent server

A small Express server is included that exposes a `Hello World` A2A agent on port 3000. To start it locally:

```bash
npm install express cors
node server.js
```

The marketplace page in `index.html` points at `http://localhost:3000/a2a` by default. Opening the page will automatically list the `Hello World Agent` which can be queried via the provided button.

