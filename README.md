# Toast App Backend

A Cloudflare Workers backend API for sending "toasts" to other users, built with Hono and D1.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables in .env:
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id  
CLOUDFLARE_DATABASE_ID=your_database_id

# 3. Set up local development database
npm run db:setup

# 4. Start local development server
npm run dev
```

Your API will be available at `http://localhost:8787` with a local database containing production data.

## 🔄 Development Workflow

### Local Development
```bash
npm run dev              # Start dev server with local database
# Make your changes and test on http://localhost:8787
```

### Database Management
```bash
npm run db:setup         # Set up local database (run once)
npm run db:sync          # Re-sync local data from production
npm run db:test          # Test remote database connection
```

### Production Deployment
```bash
npm run deploy           # Deploy to production
```

### Code Quality
```bash
npm run check:fix        # Auto-fix linting issues
```

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono  
- **Database**: Cloudflare D1 (local for dev, remote for production)
- **ORM**: Drizzle ORM
- **Language**: TypeScript

## API Endpoints

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
- `GET /` - API info and available endpoints
- `GET /health` - Health check

## 🛡️ Security & Safety

### Database Protection
- **Local development**: Uses isolated local database copy
- **Production access**: Requires explicit confirmation for destructive operations
- **Data sync**: `npm run db:setup` copies production data to local safely

### Safe Operations
```bash
npm run db:clear -- --confirm    # Clear production (requires confirmation)
npm run db:sync                  # Safe: only reads from production
npm run dev                      # Safe: uses local database only
```

## Environment Setup

Create a `.env` file with your Cloudflare credentials:

```env
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here  
CLOUDFLARE_DATABASE_ID=your_database_id_here
```

**Getting your credentials:**
1. **Account ID**: Go to Cloudflare dashboard, copy from right sidebar
2. **API Token**: Profile → API Tokens → Create Token → Custom Token with D1:Edit permission  
3. **Database ID**: Create D1 database with `wrangler d1 create toast-app-db`

## Project Structure

```
src/
├── index.ts          # Main application & routes
├── db/               # Database setup
│   ├── index.ts      # Worker DB connection  
│   ├── remote.ts     # API-based connection
│   └── schema.ts     # Database schema
├── routes/           # API route handlers
│   ├── users.ts      # User endpoints
│   └── toasts.ts     # Toast endpoints  
├── scripts/          # Database utilities
└── types/            # TypeScript definitions
```

## 💡 How It Works

- **Local Development**: Uses a local SQLite database that mirrors production
- **Production**: Uses remote Cloudflare D1 database
- **Data Sync**: Local database gets a copy of production data for realistic testing
- **Safe Testing**: Changes made locally don't affect production database
- **Simple Deployment**: Deploy when ready to push changes to production
