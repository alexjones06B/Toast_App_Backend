# 🚀 Quick Start: D1 + Drizzle with API Key

## ⚡ Setup in 3 Steps

### 1️⃣ Get Cloudflare Credentials
```bash
# Go to: https://dash.cloudflare.com/profile/api-tokens
# Create Custom Token with D1 Edit permissions
# Copy: Account ID + API Token
```

### 2️⃣ Update .env file (in Toast_App_Backend-1 directory)
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here  # ← REPLACE THIS
CLOUDFLARE_DATABASE_ID=8aaadd65-d03c-4cff-b3ad-e9c90da11f88
CLOUDFLARE_API_TOKEN=your_api_token_here  # ← REPLACE THIS
```

### 3️⃣ Test Connection
```bash
cd Toast_App_Backend-1
npm run db:test
```

---

## 📝 Common Commands

```bash
# Test remote connection
npm run db:test

# Apply migrations to remote database
npm run db:migrate:remote

# Open Drizzle Studio (connects to remote DB)
npm run db:studio

# Generate migrations after schema changes
npm run db:generate

# Apply migrations to production
npm run db:migrate:prod

# Development
npm run dev              # Local D1
npm run dev:remote       # Remote D1

# Deploy
npm run deploy
```

---

## 💻 Usage Examples

### In Cloudflare Worker (Runtime)
```typescript
import { createDB } from "./db";

export default {
  async fetch(request: Request, env: Env) {
    const db = createDB(env);  // Uses binding, no API key needed
    const users = await db.query.users.findMany();
    return Response.json(users);
  }
}
```

### External Script (with API Key)
```typescript
import { createRemoteDB } from "./db/remote";

const db = createRemoteDB(
  process.env.CLOUDFLARE_API_TOKEN!,
  process.env.CLOUDFLARE_ACCOUNT_ID!,
  process.env.CLOUDFLARE_DATABASE_ID!
);

const users = await db.query("SELECT * FROM users");
```

---

## 🔧 Configuration Files

### drizzle.config.ts
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
```

### wrangler.jsonc
```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "toast",
    "database_id": "8cbde640-7a43-4760-9c14-dd3145c402c1"
  }]
}
```

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find name 'process'" | ✅ Fixed - `node` added to tsconfig types |
| "Authentication required" | Check API token has D1 permissions |
| "Database not found" | Verify database ID is correct |
| Can't connect to studio | Ensure .env is in parent directory |

---

## 📚 Key Files

- **`src/db/index.ts`** - Worker runtime DB (uses binding)
- **`src/db/remote.ts`** - Remote DB access (uses API key)
- **`src/db/schema.ts`** - Database schema
- **`drizzle.config.ts`** - Drizzle Kit config
- **`D1_SETUP_GUIDE.md`** - Full documentation

---

**Ready to go?** Run `npm run db:test` to verify your connection! 🎉
