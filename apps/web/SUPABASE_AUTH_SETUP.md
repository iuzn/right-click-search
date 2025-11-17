# Supabase Auth Setup Guide

## 1️⃣ Create User in Supabase Dashboard

### Method A: From Dashboard (Recommended)

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **jhsfbhehkiwxzholmufu**
3. From left menu, click **Authentication** → **Users** tab
4. Click **"Add user"** → **"Create new user"** button in top right
5. Fill the form:
   - **Email**: `info@ibrahimuzun.com`
   - **Password**: Choose a strong password (at least 6 characters)
   - **Auto Confirm User**: ✅ Check (to skip email confirmation)
6. Click **Create user** button

### Method B: Create with SQL

Run this command in SQL Editor:

```sql
-- 1. Create auth user (change the password!)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'info@ibrahimuzun.com',
  crypt('YOUR_PASSWORD_HERE', gen_salt('bf')), -- ⚠️ Change the password!
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## 2️⃣ Add to Admins Table

Add your email to the `admins` table (skip if already added):

```sql
INSERT INTO public.admins (email)
VALUES ('info@ibrahimuzun.com')
ON CONFLICT (email) DO NOTHING;
```

## 3️⃣ Enable Email Authentication

1. Go to **Authentication** → **Providers** tab
2. Make sure **Email** provider is active
3. From **Settings** → **Auth** → **Email Auth** section:
   - ✅ **Enable email signup** should be checked
   - ✅ **Confirm email** can be disabled (for development)

## 4️⃣ Test It

1. Start your application:

   ```bash
   bun run dev
   ```

2. Open in browser:

   ```
   http://localhost:3000/admin/login
   ```

3. Sign in:

   - **Email**: `info@ibrahimuzun.com`
   - **Password**: The password you set

4. After successful login, you'll be redirected to `/admin/platforms` page! 🎉

## 🔒 Security Notes

- **Middleware** protects all `/admin/*` routes
- Only users in `admins` table can access
- Session is stored securely in Supabase cookies
- Data protection active with RLS policies

## 📊 Check User Status

Check user with SQL:

```sql
-- Check auth user
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'info@ibrahimuzun.com';

-- Check admin permission
SELECT * FROM public.admins
WHERE email = 'info@ibrahimuzun.com';
```

## 🐛 Troubleshooting

### "Invalid login credentials" error

- Check email and password
- Verify user is created in Supabase Dashboard

### "Email not confirmed" error

- **Auto Confirm User** should be checked in Dashboard
- Or update with SQL: `email_confirmed_at = NOW()`

### No access to admin panel

- Make sure your email is in `admins` table
- Check middleware logs (you can add console.log)

## 🎯 Difference: Firebase Auth vs Supabase Auth

| Feature     | Firebase Auth   | Supabase Auth (New) |
| ----------- | --------------- | -------------------- |
| Provider    | Firebase        | Supabase             |
| Database    | Separate        | Integrated (PostgreSQL) |
| RLS         | No              | ✅ Works directly    |
| Admin Check | Extra query     | Automatic with RLS   |
| Session     | Firebase token  | Supabase cookie      |
| Analytics   | ✅ Used         | -                    |

**Result**: Firebase is only used for Analytics, Auth is completely Supabase! 🚀
