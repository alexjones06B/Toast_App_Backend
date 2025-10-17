# Database Scripts

This directory contains SQL scripts for local development.

## Files

- `seed.sql` - Adds sample users and toasts to the database
- `clear.sql` - Removes all data from the database

## Usage

### Seed the database
```bash
npm run db:seed
# or directly:
wrangler d1 execute toast --local --file=src/scripts/seed.sql
```

### Clear the database
```bash
npm run db:clear
# or directly:
wrangler d1 execute toast --local --file=src/scripts/clear.sql
```

## Sample Data

The seed script creates:
- 4 sample users (Alice, Bob, Charlie, Diana)
- 4 sample toasts between these users

All inserts use `INSERT OR IGNORE` to prevent duplicate key errors.