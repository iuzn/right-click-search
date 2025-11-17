# Platform Catalog Setup Guide

This document contains the setup steps for Platform Catalog and Admin Panel for Right Click Search Extension.

## 📋 Requirements

- Node.js 18+ or Bun
- Supabase account
- Firebase account (existing - for Analytics)

## 🚀 Installation Steps

### 1. Creating Supabase Project

1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Copy the following from Project Settings > API:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep it secure!)

### 2. Setting Environment Variables

Create `.env.local` file (reference: `env.example`):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Configuration
ADMIN_EMAIL=your-admin-email@example.com
```

### 3. Database Schema Setup

1. Open SQL Editor in Supabase Dashboard
2. Copy the content of `supabase/schema.sql` file
3. Run it in SQL Editor

This will create:

- `platforms` table
- `admins` table
- RLS (Row Level Security) policies
- Storage bucket and policies
- Required indexes

### 4. Creating Icons Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Click "New bucket" button
3. Bucket name: `icons`
4. Mark as public bucket
5. Create

### 5. Adding Admin User

Run this command in Supabase SQL Editor:

```sql
INSERT INTO public.admins (email)
VALUES ('your-admin-email@example.com');
```

**IMPORTANT:** You also need to create a user with the same email in Firebase Authentication.

### 6. Creating Firebase Admin User

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Go to Your Project > Authentication > Users
3. Click "Add user" button
4. Enter the email you added to Supabase and a password
5. Create the user

### 7. Package Installation

```bash
bun install
```

### 8. Adding Platform Seed Data

To add initial platforms:

```bash
bun run seed
```

This command adds the following platforms:

- Google Web, Google Images
- GitHub Code, GitHub Repos
- Stack Overflow, MDN, NPM
- LinkedIn, Twitter/X
- YouTube, Amazon
- DuckDuckGo, Bing, Reddit
- ArXiv, Perplexity
- ChatGPT, Claude

### 9. Starting Development Server

```bash
bun run dev
```

The application will run at http://localhost:3000.

## 📱 Access Points

- **Home Page**: http://localhost:3000
- **Platform Catalog**: http://localhost:3000/catalog
- **Admin Panel**: http://localhost:3000/admin/platforms
- **Admin Login**: http://localhost:3000/admin/login

## 🔐 Admin Panel Usage

1. Go to `/admin/login` page
2. Enter the email and password you created in Firebase
3. After successful login, you will be redirected to `/admin/platforms` page
4. From here you can manage platforms:
   - Add new platform
   - Edit existing platforms
   - Toggle platform enabled/disabled status
   - Delete platform
   - Upload icon

## 🎨 Platform Icon Upload

1. When creating or editing a platform in admin panel
2. Click "Upload Icon" button
3. Select a file in PNG, JPG or SVG format (max 500KB)
4. Icon will be automatically uploaded to Supabase Storage and get a public URL

## 🔌 Chrome Extension Integration

### Content Script Update

Add this code to the content script in the `extension codes (reference only)` folder:

```typescript
// content/index.ts
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "https://your-production-domain.com",
]);

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (!ALLOWED_ORIGINS.has(event.origin)) return;

  if (data.type === "RCS_BRIDGE_HANDSHAKE") {
    window.postMessage(
      {
        type: "RCS_BRIDGE_ACK",
        extVersion: chrome.runtime.getManifest().version,
      },
      event.origin
    );
    return;
  }

  if (data.type === "RCS_ADD_ENGINES") {
    chrome.runtime.sendMessage(
      {
        type: "RCS_ADD_ENGINES",
        engines: data.engines,
        requestId: data.requestId,
      },
      (resp) => {
        const ok = resp?.ok ?? false;
        window.postMessage(
          {
            type: "RCS_RESULT",
            requestId: data.requestId,
            ok,
            message: resp?.message,
          },
          event.origin
        );
      }
    );
  }
});
```

For detailed integration code: `docs/extension-content-script.md`

## 📊 Database Structure

### Platforms Table

- `id` (uuid): Primary key
- `name` (text): Platform name
- `slug` (text): Unique slug
- `category` (text): Category (search, code, ai, social, shopping)
- `url_pattern` (text): Search URL (with %s placeholder)
- `context` (text[]): Contexts (selection, image)
- `icon_url` (text): Icon URL
- `tags` (text[]): Tags
- `featured` (boolean): Featured platform
- `supports_prefill` (boolean): %s support
- `enabled` (boolean): Active/inactive status

### Admins Table

- `id` (uuid): Primary key
- `email` (text): Admin email

## 🔒 Security

- **RLS (Row Level Security)**: Active
  - Public: Can only read `enabled=true` platforms
  - Admin: Only emails in `admins` table can write
- **Storage Policies**:
  - Icons bucket public read
  - Only admins can upload icons
- **Origin Allowlist**: Extension bridge only accepts messages from allowed origins
- **Input Validation**: All forms validated with Zod schemas

## 🐛 Troubleshooting

### Extension not connecting

- Check the `ALLOWED_ORIGINS` list in content script
- Check error messages in browser console
- Make sure extension is loaded

### Admin login not working

- Is user created in Firebase?
- Is email added to Supabase `admins` table?
- Make sure same email is used in both places

### Platforms not showing

- Are there platforms with `enabled=true` in database?
- Are Supabase RLS policies set up correctly?
- Check network errors in browser console

### Icon not uploading

- Is `icons` storage bucket created?
- Are storage policies set correctly?
- Is file size smaller than 500KB?
- Is file format PNG, JPG or SVG?

## 📝 Next Steps

1. ✅ Supabase setup completed
2. ✅ Database schema created
3. ✅ Admin user added
4. ✅ Seed data loaded
5. ⬜ Extension content script updated
6. ⬜ Production deployment done

## 📚 More Information

- **Technical Details**: `PLATFORM.md`
- **Extension Integration**: `docs/extension-content-script.md`
- **API Reference**: Server actions file - `src/app/admin/actions.ts`
