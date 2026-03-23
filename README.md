# Hyperswitch Demo App v1.24

Organized monorepo structure for easier development and deployment.

## Folder Structure

```
hyperswitch-demo-app/
├── client/          # React frontend
│   ├── src/         # React source files
│   ├── public/      # Static assets
│   ├── dist/        # Production build
│   ├── package.json # Client dependencies
│   └── webpack.config.js
├── server/          # Node.js backend
│   └── server.js    # Express server
├── scripts/         # Build & deploy scripts
│   └── deploy.sh    # Netlify deployment
├── tests/           # Test files
│   ├── test_env.js
│   └── test-suite.sh
├── docs/            # Documentation
│   ├── README.md
│   └── AGENTS.md
├── logs/            # Log files
│   ├── server.log
│   └── frontend.log
├── .env             # Environment variables
├── .env.example     # Example env file
├── .env.production  # Production env file
├── package.json     # Root package.json
├── netlify.toml     # Netlify config
└── node_modules/    # Dependencies
```

## Quick Start (Local Development)

```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm start
```

## Deploy to Netlify

```bash
export REACT_APP_API_URL=https://hs-demo.onrender.com && npm run deploy
```

## Version

v1.24.0 - Restructured for better organization
