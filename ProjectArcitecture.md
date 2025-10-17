# Toast App - Full Stack Architecture

A modern toast notification application built with a serverless-first approach using React, Cloudflare Workers, and D1 database.

## 🏗️ Architecture Overview

```
Frontend (React + Vite) → GitHub Pages → Cloudflare Pages (future)
    ↓ HTTP/HTTPS (axios)
Backend (Hono.js) → Cloudflare Workers
    ↓ SQL queries
Database → Cloudflare D1 (SQLite)
```

## 📁 Project Structure

```
toast-app/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API calls (axios)
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                 # Hono.js API (this repo)
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── db/            # Database operations
│   │   └── types/         # Shared types
│   ├── migrations/         # D1 database migrations
│   ├── wrangler.toml      # Cloudflare Workers config
│   └── package.json
└── shared/                 # Shared utilities and types
    ├── types/             # Common TypeScript types
    └── utils/             # Shared utilities
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast dev server, optimized builds)
- **HTTP Client**: Axios for API communication
- **Styling**: CSS Modules or Tailwind CSS
- **State Management**: React hooks (useState, useContext) or Zustand for complex state

### Backend
- **Runtime**: Cloudflare Workers (V8 isolates, edge computing)
- **Framework**: Hono.js (lightweight, fast, TypeScript-first)
- **Language**: TypeScript
- **Validation**: Zod for request/response validation
- **Authentication**: JWT tokens (if needed)

### Database
- **Service**: Cloudflare D1 (serverless SQLite)
- **Query Builder**: Drizzle ORM or native D1 API
- **Migrations**: Wrangler CLI migration system

### Hosting & Deployment

#### Current Setup (Phase 1)
- **Frontend**: GitHub Pages (free, simple CI/CD)
- **Backend**: Cloudflare Workers (generous free tier)
- **Database**: Cloudflare D1 (free tier: 5GB storage, 25M reads/day)

#### Future Migration (Phase 2)
- **Frontend**: Cloudflare Pages (better performance, edge caching)
- **Benefits**: Single vendor, better integration, global CDN

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### Frontend Setup
```bash
# Create React + Vite project
npm create vite@latest toast-app-frontend -- --template react-ts
cd toast-app-frontend
npm install

# Add dependencies
npm install axios
npm install -D @types/node

# Development
npm run dev
```

### Backend Setup
```bash
# Initialize Cloudflare Workers project
npm create hono@latest toast-app-backend
cd toast-app-backend

# Install dependencies
npm install
npm install @cloudflare/workers-types --save-dev

# Setup Wrangler CLI
npm install -g wrangler
wrangler login

# Development
npm run dev
```

### Database Setup
```bash
# Create D1 database
wrangler d1 create toast-app-db

# Run migrations (local)
wrangler d1 migrations apply toast-app-db --local

# Run migrations (production)
wrangler d1 migrations apply toast-app-db
```

## 📋 Key Features to Implement

### Core Toast Functionality
- [ ] Create toast notifications
- [ ] Display toast queue
- [ ] Auto-dismiss after timeout
- [ ] Manual dismiss
- [ ] Different toast types (success, error, warning, info)
- [ ] Position configuration (top-right, bottom-left, etc.)

### API Endpoints
```typescript
GET    /api/toasts           # Get all toasts
POST   /api/toasts           # Create new toast
PUT    /api/toasts/:id       # Update toast
DELETE /api/toasts/:id       # Delete toast
GET    /api/toasts/:id       # Get specific toast
```

### Database Schema
```sql
CREATE TABLE toasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('success', 'error', 'warning', 'info')) DEFAULT 'info',
  duration INTEGER DEFAULT 5000,
  position TEXT DEFAULT 'top-right',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration Files

### Frontend (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/toast-app/', // For GitHub Pages
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787', // Local Wrangler dev server
        changeOrigin: true,
      }
    }
  }
})
```

### Backend (`wrangler.toml`)
```toml
name = "toast-app-backend"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "toast-app-db"
database_id = "your-database-id"

[vars]
ENVIRONMENT = "development"
```

## 🚦 Deployment Strategy

### GitHub Actions (Frontend)
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Cloudflare Workers Deployment
```bash
# Deploy to production
wrangler deploy

# Deploy to staging
wrangler deploy --env staging
```

## 🔐 Security Considerations

- **CORS**: Configure appropriate CORS headers for production domains
- **Rate Limiting**: Implement rate limiting on API endpoints
- **Input Validation**: Use Zod schemas for all API inputs
- **Environment Variables**: Store sensitive data in Wrangler secrets
- **HTTPS**: All communication over HTTPS (enforced by platforms)

## 📈 Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Bundle analysis with `npm run build -- --analyze`
- Image optimization and lazy loading
- Service Worker for caching (future enhancement)

### Backend
- Database connection pooling (handled by D1)
- Response caching with Cloudflare Cache API
- Minimize cold starts with Hono's lightweight footprint
- Edge computing benefits from Cloudflare Workers

## 🧪 Testing Strategy

### Frontend Testing
```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test
```

### Backend Testing
```bash
# Install testing dependencies
npm install -D vitest @cloudflare/workers-types

# Run tests
npm run test
```

## 📊 Monitoring & Analytics

- **Cloudflare Analytics**: Built-in request metrics
- **Custom Logging**: Structured logging with Hono middleware
- **Error Tracking**: Integration with Sentry (optional)
- **Performance Monitoring**: Web Vitals tracking

## 🔄 Migration Path: GitHub Pages → Cloudflare Pages

### Benefits of Migration
- **Performance**: Global CDN with edge caching
- **Integration**: Seamless integration with Workers and D1
- **Analytics**: Built-in analytics and insights
- **Custom Domains**: Easy SSL and custom domain setup
- **Branch Deployments**: Preview deployments for PRs

### Migration Steps
1. Connect GitHub repo to Cloudflare Pages
2. Configure build settings (npm run build)
3. Update API endpoints to production URLs
4. Test deployment on Cloudflare subdomain
5. Update DNS records for custom domain
6. Monitor performance and analytics

## 📚 Resources & Documentation

- [Hono.js Documentation](https://hono.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
