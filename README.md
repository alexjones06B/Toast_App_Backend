# Toast App Backend

A Cloudflare Workers-based backend API for the Toast App, built with Hono framework and D1 database.

## Overview

The Toast App allows users to send "toasts" to each other - a simple social interaction system. This backend provides user management and toast functionality.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Language**: TypeScript

## Project Structure

```
src/
├── index.ts          # Main application entry point
├── db/               # Database configuration and schema
│   ├── index.ts      # Database connection
│   ├── remote.ts     # Remote database connection
│   └── schema.ts     # Database schema definitions
├── routes/           # Route modules
│   ├── users.ts      # User management endpoints
│   └── toasts.ts     # Toast management endpoints
├── scripts/          # Database maintenance scripts
│   ├── seed.sql      # Sample data for development
│   ├── clear.sql     # Clear all data
│   └── README.md     # Scripts documentation
└── types/
    └── env.ts        # Environment type definitions
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Cloudflare account (for deployment)

### Installation

```bash
npm install
```

### Local Development

1. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

2. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8787`

### Database Management

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate new migrations |
| `npm run db:migrate` | Apply migrations (local) |
| `npm run db:migrate:prod` | Apply migrations (production) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:clear` | Clear all data |
| `npm run db:studio` | Open Drizzle Studio |

## API Endpoints

### Root
- `GET /` - API documentation

### Users
- `GET /users` - Get all users
- `POST /users/register` - Register new user
- `POST /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Toasts
- `GET /toasts` - Get all toasts
- `POST /toasts/send` - Send a toast
- `POST /toasts/my-toasts` - Get user's toasts
- `POST /toasts/find-users` - Search users

### Health
- `GET /health` - Health check

For detailed API documentation, see [API_DOCS.md](./API_DOCS.md).

## Deployment

### Production Deployment

```bash
npm run deploy
```

### Environment Configuration

The app uses Cloudflare D1 bindings. Make sure your `wrangler.toml` is configured correctly:

```toml
[env.production.d1_databases]
binding = "DB"
database_name = "toast-app-db"
database_id = "your-database-id"
```

## Development Notes

- **Local Development**: Uses local D1 database (SQLite file)
- **Remote Development**: `npm run dev:remote` (requires authentication)
- **Database**: Currently optimized for local development due to Cloudflare auth issues

## Scripts

- `npm run dev` - Start local development server
- `npm run dev:remote` - Start with remote D1 database
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run cf-typegen` - Generate Cloudflare bindings types

## Contributing

1. Follow the existing code structure
2. Use TypeScript strict mode
3. Run migrations before testing changes
4. Update API documentation when adding endpoints

## License

[Add your license here]
