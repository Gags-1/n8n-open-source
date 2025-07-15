# AIFlow Supabase Setup Guide

This guide will help you set up Supabase with Clerk authentication for your AIFlow application.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Clerk authentication already configured
3. Node.js and npm/yarn installed

## Step 1: Configure Supabase Project

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for the project to be fully provisioned

### 1.2 Get Supabase Credentials
1. Go to Project Settings > API
2. Copy your Project URL
3. Copy your anon/public key

### 1.3 Configure Clerk Integration in Supabase
1. Go to Authentication > Third-party Auth
2. Add Clerk as a provider
3. In your Clerk Dashboard:
   - Go to JWT Templates
   - Create a new template named "supabase"
   - Use this configuration:
   ```json
   {
     "aud": "authenticated",
     "exp": {{exp}},
     "iat": {{iat}},
     "iss": "https://your-clerk-frontend-api",
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address.email_address}}",
     "role": "authenticated"
   }
   ```

## Step 2: Database Setup

### 2.1 Run the Migration
1. In your Supabase project, go to SQL Editor
2. Copy and run the contents of `db/workflows_schema.sql`
3. This will create:
   - `workflows` table with proper structure
   - Row Level Security (RLS) policies
   - Indexes for performance
   - Auto-update triggers

### 2.2 Verify RLS Policies
The following policies are automatically created:
- Users can only view their own workflows
- Users can only insert workflows for themselves
- Users can only update their own workflows
- Users can only delete their own workflows

## Step 3: Environment Configuration

### 3.1 Update Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Ensure your Clerk variables are configured

### 3.2 Test the Connection
1. Start your development server: `npm run dev`
2. Sign in with Clerk
3. Try creating a new workflow
4. Verify data is saved in Supabase (check the workflows table)

## Step 4: Migration from localStorage (Optional)

If you have existing data in localStorage, you can migrate it:

### 4.1 Export Existing Data
1. Open browser console on your current app
2. Run: `console.log(JSON.stringify(localStorage.getItem("aiflow_flows")))`
3. Copy the output

### 4.2 Import to Database
1. Create a temporary script or use the browser console
2. Parse the localStorage data
3. Use the API endpoints to create workflows in the database

## Features Implemented

### ✅ Database Schema
- **workflows** table with UUID primary keys
- JSONB storage for nodes and edges
- Automatic timestamps
- User isolation via RLS

### ✅ Authentication Integration
- Clerk JWT tokens used for Supabase auth
- User ID from Clerk (`sub` claim) used for RLS
- Automatic token refresh

### ✅ API Layer
- RESTful API endpoints for CRUD operations
- Server-side authentication validation
- Proper error handling

### ✅ Frontend Integration
- React hooks for database operations
- Automatic loading states
- Error handling and user feedback
- Migration from localStorage to database

### ✅ Security Features
- Row Level Security (RLS) policies
- User can only access their own data
- Secure JWT token validation
- SQL injection protection

## API Endpoints

### Workflows
- `GET /api/workflows` - Get all user workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/[id]` - Get specific workflow
- `PUT /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow

## Database Schema

```sql
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check if Clerk JWT template is configured correctly
   - Verify the template name is "supabase"
   - Ensure the user is properly authenticated

2. **RLS policy errors**
   - Verify the JWT token contains the correct `sub` claim
   - Check if RLS policies are enabled on the table
   - Test with the SQL editor using the RLS bypass

3. **Connection issues**
   - Verify Supabase URL and anon key are correct
   - Check if the Supabase project is active
   - Ensure network connectivity

### Testing RLS Policies

You can test RLS policies in the Supabase SQL editor:

```sql
-- Test as authenticated user (replace with actual user ID)
SELECT auth.jwt() ->> 'sub' as current_user_id;

-- Test selecting workflows
SELECT * FROM workflows;

-- Test inserting workflow
INSERT INTO workflows (user_id, name) 
VALUES (auth.jwt() ->> 'sub', 'Test Workflow');
```

## Production Considerations

1. **Environment Variables**
   - Use different Supabase projects for development/production
   - Secure your environment variables
   - Use Vercel/Netlify environment settings for deployment

2. **Performance**
   - The schema includes indexes for common queries
   - Consider adding more indexes based on usage patterns
   - Monitor query performance in Supabase dashboard

3. **Backup**
   - Enable Supabase automatic backups
   - Consider implementing your own backup strategy
   - Test restore procedures

4. **Monitoring**
   - Monitor API usage in Supabase dashboard
   - Set up alerts for errors
   - Track user growth and usage patterns