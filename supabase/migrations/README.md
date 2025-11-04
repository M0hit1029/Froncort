# Database Migrations

This directory contains SQL migrations for the Froncort database schema.

## Migration Files

### 001_create_tables.sql
**Purpose**: Initial database schema setup  
**Status**: ✅ Required  
**Contains**:
- Creates all core tables (users, projects, documents, etc.)
- Enables Row-Level Security (RLS) on all tables
- Creates initial RLS policies
- Adds performance indexes

**Run this first** when setting up a new Supabase project.

### 002_add_project_visibility.sql
**Purpose**: Add project visibility features  
**Status**: ✅ Required  
**Contains**:
- Adds `visibility` column to projects table
- Updates RLS policies for visibility-based access
- Adds indexes for better query performance

**Run this after** running the initial migration.

## How to Run Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Check for success message
8. Verify in **Table Editor** that changes were applied

### Method 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db execute --file supabase/migrations/001_create_tables.sql
supabase db execute --file supabase/migrations/002_add_project_visibility.sql
```

### Method 3: Direct PostgreSQL Connection

If you have direct database access:

```bash
psql $DATABASE_URL < supabase/migrations/001_create_tables.sql
psql $DATABASE_URL < supabase/migrations/002_add_project_visibility.sql
```

## Verification

After running migrations, verify they were successful:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Indexes
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## Migration Order

**IMPORTANT**: Run migrations in numerical order:

1. ✅ `001_create_tables.sql` - Creates base schema
2. ✅ `002_add_project_visibility.sql` - Adds visibility features

Running out of order may cause errors.

## Rollback

If you need to rollback a migration:

### Rollback 002_add_project_visibility.sql
```sql
-- Remove visibility column
ALTER TABLE public.projects DROP COLUMN IF EXISTS visibility;

-- Restore original policies
-- (Copy policy definitions from 001_create_tables.sql)
```

### Rollback 001_create_tables.sql
```sql
-- WARNING: This will delete all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## Troubleshooting

### Error: "relation does not exist"
- **Cause**: Migration 001 not run yet
- **Solution**: Run `001_create_tables.sql` first

### Error: "column already exists"
- **Cause**: Migration already applied
- **Solution**: Check if changes are already in place, skip if so

### Error: "permission denied"
- **Cause**: Insufficient database permissions
- **Solution**: Ensure you're using an admin user or service role key

### Error: "policy already exists"
- **Cause**: Policy already created
- **Solution**: Drop the existing policy first or skip if working correctly

## Best Practices

1. **Backup First**: Always backup your database before running migrations
2. **Test Locally**: Test migrations on a development database first
3. **One at a Time**: Run one migration at a time
4. **Verify Changes**: Check tables and policies after each migration
5. **Document Issues**: Note any errors or issues for troubleshooting

## Production Deployment

For production environments:

1. **Staging First**: Test on staging environment
2. **Backup**: Create full database backup
3. **Maintenance Mode**: Put app in maintenance mode if needed
4. **Run Migration**: Execute migration during low-traffic period
5. **Verify**: Thoroughly test all functionality
6. **Monitor**: Watch for errors in logs
7. **Rollback Plan**: Have rollback script ready

## Support

For migration issues:
- Check the [SETUP_GUIDE.md](../../SETUP_GUIDE.md)
- Review [PROJECT_VISIBILITY_SETUP.md](../../docs/PROJECT_VISIBILITY_SETUP.md)
- Check Supabase documentation
- Open an issue on GitHub

## Migration History

| Migration | Date Added | Purpose | Status |
|-----------|------------|---------|--------|
| 001 | Initial | Create base schema | ✅ Required |
| 002 | 2025-11-04 | Add visibility | ✅ Required |

## Future Migrations

Planned migrations:
- [ ] 003: Add project members table enhancements
- [ ] 004: Add project categories/tags
- [ ] 005: Add advanced search indexes
