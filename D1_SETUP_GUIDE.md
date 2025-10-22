# D1 Database Setup with Drizzle & API Key

This guide explains how to set up and use Cloudflare D1 with Drizzle ORM using API key authentication.

## 📋 Prerequisites

1. Cloudflare account
2. Cloudflare API token with D1 permissions
3. Node.js installed
4. This project's dependencies installed

## 🔑 Step 1: Get Your Cloudflare Credentials

### Account ID
1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Your Account ID is in the URL: `dash.cloudflare.com/<ACCOUNT_ID>/...`
3. Or find it in the sidebar under "Account Home"

### API Token (with D1 permissions)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Choose "Create Custom Token"
4. Configure:
   - **Token name**: `D1 Access Token`
   - **Permissions**: 
     - Account → D1 → Edit
   - **Account Resources**: Include → Your Account
5. Click "Continue to summary" → "Create Token"
6. **Copy the token immediately** (you won't see it again!)

### Database ID
Your database ID is already configured: `8cbde640-7a43-4760-9c14-dd3145c402c1`

## 🔧 Step 2: Configure Environment Variables

Update your `.env` file in the **root directory** (one level up from Toast_App_Backend-1):

```env
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_here  # Replace with your Account ID
CLOUDFLARE_DATABASE_ID=8cbde640-7a43-4760-9c14-dd3145c402c1
CLOUDFLARE_API_TOKEN=your_api_token_here  # Replace with your API Token

# Environment
NODE_ENV=development
```

## 📦 Step 3: Install Dependencies (if needed)

```bash
cd Toast_App_Backend-1
npm install
```

## 🗄️ Step 4: Database Operations

### Generate Migrations
When you modify `src/db/schema.ts`:
```bash
npm run db:generate
```

### Apply Migrations

**Local Development:**
```bash
npm run db:migrate
```

**Production (Remote):**
```bash
npm run db:migrate:prod
```

### Seed Database
```bash
npm run db:seed
```

### Open Drizzle Studio
Visual database browser:
```bash
npm run db:studio
```

This will connect to your **remote** D1 database using your API credentials!

## 💻 Step 5: Using D1 in Your Code

### In Cloudflare Workers (Runtime - Recommended)

```typescript
import { createDB } from "./db";
import type { Env } from "./types/env";

export default {
  async fetch(request: Request, env: Env) {
    // Use the binding - no API key needed at runtime
    const db = createDB(env);
    
    const users = await db.query.users.findMany();
    return Response.json(users);
  }
}
```

### Remote Access (Scripts/External)

For scripts or external access using API key:

```typescript
import { createRemoteDB } from "./db/remote";

const db = createRemoteDB(
  process.env.CLOUDFLARE_API_TOKEN!,
  process.env.CLOUDFLARE_ACCOUNT_ID!,
  process.env.CLOUDFLARE_DATABASE_ID!
);

// Query the database
const users = await db.query("SELECT * FROM users");
console.log(users);

// Parameterized queries (safer!)
const user = await db.query(
  "SELECT * FROM users WHERE id = ?",
  [userId]
);
```

## 🚀 Step 6: Development Workflow

### Local Development
```bash
npm run dev
```
This uses Wrangler dev with local D1 database.

### Remote Development
```bash
npm run dev:remote
```
This connects to your production D1 database.

### Deploy to Production
```bash
npm run deploy
```

## 📁 Project Structure

```
Toast_App_Backend-1/
├── src/
│   ├── db/
│   │   ├── index.ts      # Main DB connection (uses Worker binding)
│   │   ├── remote.ts     # Remote DB connection (uses API key)
│   │   └── schema.ts     # Drizzle schema definitions
│   └── index.ts          # Worker entry point
├── migrations/           # Generated SQL migrations
├── drizzle.config.ts    # Drizzle Kit configuration (for remote access)
├── wrangler.jsonc       # Cloudflare Workers config
└── .env                 # Environment variables (in parent dir)
```

## 🔒 Security Best Practices

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Rotate API tokens regularly** via Cloudflare dashboard
3. **Use minimal permissions** - only grant D1 Edit, not Account-wide access
4. **Use parameterized queries** to prevent SQL injection:
   ```typescript
   // ✅ Good
   await db.query("SELECT * FROM users WHERE id = ?", [userId]);
   
   // ❌ Bad
   await db.query(`SELECT * FROM users WHERE id = ${userId}`);
   ```

## 🛠️ Troubleshooting

### "Cannot find name 'process'" Error
✅ **Fixed!** Added `"node"` to `types` in `tsconfig.json`

### "Authentication required" Error
- Check your API token is correct and has D1 permissions
- Ensure `CLOUDFLARE_ACCOUNT_ID` matches your account
- Verify token hasn't expired

### "Database not found" Error
- Verify `CLOUDFLARE_DATABASE_ID` is correct
- Check the database exists: `wrangler d1 list`

### Migrations Not Applying
```bash
# Check migration status
wrangler d1 migrations list toast

# Force apply migrations
wrangler d1 migrations apply toast --remote
```

## 📚 Additional Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 HTTP API Reference](https://developers.cloudflare.com/api/operations/cloudflare-d1-query-database)

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Local dev with local D1
npm run dev:remote             # Local dev with remote D1

# Database
npm run db:generate            # Generate migrations from schema
npm run db:migrate             # Apply migrations locally
npm run db:migrate:prod        # Apply migrations to production
npm run db:studio              # Open Drizzle Studio
npm run db:seed               # Seed local database
npm run db:clear              # Clear local database

# Deployment
npm run deploy                # Deploy to Cloudflare Workers

# Code Quality
npm run check                 # Run Biome checks
npm run check:fix             # Auto-fix issues
npm run format                # Check formatting
npm run format:fix            # Auto-fix formatting
```

## ✅ Verification Checklist

- [ ] `.env` file updated with correct credentials
- [ ] `CLOUDFLARE_ACCOUNT_ID` is set
- [ ] `CLOUDFLARE_API_TOKEN` is set and valid
- [ ] `npm install` completed successfully
- [ ] `npm run db:studio` connects successfully
- [ ] Can run migrations with `npm run db:migrate:prod`
- [ ] Worker deploys successfully with `npm run deploy`

---

**Need help?** Check the [API_DOCS.md](./API_DOCS.md) and [ProjectArchitecture.md](./ProjectArchitecture.md) files.
