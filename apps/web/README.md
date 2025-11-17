# Right Click Search Extension - Web Platform

A comprehensive web platform for Right Click Search Extension featuring a landing page, platform catalog, and admin panel.

## ✨ Features

### Landing Page

- **🎨 Beautiful Design**: Modern glass morphism design with smooth animations
- **🌙 Dark/Light Mode**: Automatic theme switching with system preference detection
- **📱 Fully Responsive**: Optimized for all screen sizes from mobile to desktop
- **⚡ Smooth Animations**: Powered by Framer Motion for fluid user experience
- **🔒 Privacy-Focused**: Highlights the extension's privacy-first approach

### Platform Catalog

- **🗂️ Browse Platforms**: Explore 18+ pre-configured search platforms
- **🔍 Search & Filter**: Find platforms by name, tags, category, or context
- **🎯 Multi-Select**: Select multiple platforms at once
- **🔌 One-Click Add**: Instantly add platforms to your Chrome Extension
- **📊 Categories**: Search, Code, AI, Social, Shopping
- **🖼️ Context Support**: Text selection and image search platforms

### Admin Panel

- **🔐 Secure Authentication**: Firebase Auth + Supabase RLS
- **➕ CRUD Operations**: Create, update, delete platforms
- **📤 Icon Upload**: Upload platform icons to Supabase Storage
- **⚡ Real-time Sync**: Changes reflect immediately in catalog
- **🎛️ Toggle Controls**: Enable/disable platforms, feature management

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and interactions
- **Lucide React** - Consistent iconography
- **Sonner** - Toast notifications

### Backend & Services

- **Supabase** - PostgreSQL database, authentication, and storage
- **Firebase** - Admin authentication and analytics
- **Zod** - Schema validation

### Infrastructure

- **Supabase Storage** - Platform icon hosting
- **Row Level Security (RLS)** - Data access control
- **Server Actions** - Secure server-side operations

## 🚀 Getting Started

### Quick Start

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Set up environment variables:**

   Copy `env.example` to `.env.local` and fill in your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_EMAIL=your-admin-email@example.com
   ```

3. **Set up Supabase:**

   - Run the SQL schema: `supabase/schema.sql`
   - Create the `icons` storage bucket
   - Add your admin email to `admins` table

4. **Seed initial platforms:**

   ```bash
   bun run seed
   ```

5. **Start development server:**

   ```bash
   bun run dev
   ```

6. **Open browser:**
   - Landing Page: [http://localhost:3000](http://localhost:3000)
   - Platform Catalog: [http://localhost:3000/catalog](http://localhost:3000/catalog)
   - Admin Panel: [http://localhost:3000/admin/platforms](http://localhost:3000/admin/platforms)

📖 **Detailed setup guide**: See [SETUP.md](./SETUP.md) for complete instructions.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   ├── catalog/
│   │   └── page.tsx            # Platform catalog page
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with auth guard
│   │   ├── login/
│   │   │   └── page.tsx        # Admin login page
│   │   ├── platforms/
│   │   │   └── page.tsx        # Platform management
│   │   └── actions.ts          # Server actions
│   ├── privacy-policy/
│   │   └── page.tsx            # Privacy policy
│   └── terms-of-service/
│       └── page.tsx            # Terms of service
├── components/
│   ├── catalog/
│   │   ├── PlatformCard.tsx    # Platform card component
│   │   └── CatalogHeader.tsx   # Search & filters
│   ├── admin/
│   │   ├── PlatformForm.tsx    # Platform CRUD form
│   │   └── IconUpload.tsx      # Icon upload component
│   ├── ui/
│   │   └── button.tsx          # Button component
│   └── theme-*.tsx             # Theme components
├── hooks/
│   ├── useExtensionBridge.ts   # Extension communication
│   ├── usePlatforms.ts         # Platform data fetching
│   └── useAdminAuth.ts         # Admin authentication
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase
│   │   ├── server.ts           # Server-side Supabase
│   │   └── middleware.ts       # Auth middleware
│   ├── validations/
│   │   └── platform.ts         # Zod schemas
│   ├── mapToEngine.ts          # Platform to Engine mapper
│   ├── firebase.ts             # Firebase config
│   └── utils.ts                # Utilities
├── types/
│   ├── platform.ts             # Platform types
│   └── extension-bridge.ts     # Bridge message types
└── globals.css                 # Global styles

supabase/
└── schema.sql                  # Database schema & policies

scripts/
└── seed-platforms.ts           # Seed data script

docs/
└── extension-content-script.md # Extension integration guide
```

## 🎨 Design System

- **Colors**: Uses CSS custom properties for theming
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Components**: ShadcnUI components with custom styling
- **Animations**: Framer Motion with performance optimizations

## 🔌 Chrome Extension Integration

The platform catalog integrates seamlessly with the Chrome Extension through a bridge protocol:

1. **Handshake**: Establishes connection between web page and extension
2. **Platform Selection**: User selects platforms in catalog
3. **One-Click Add**: Platforms are sent to extension via `window.postMessage`
4. **Storage Sync**: Extension stores platforms and rebuilds context menus
5. **Real-time Feedback**: Success/error notifications via toast

### Extension Setup

See [docs/extension-content-script.md](./docs/extension-content-script.md) for integration code.

## 📊 Pre-configured Platforms (18)

The platform catalog comes with 18 pre-configured platforms:

**Search Engines**: Google Web, Google Images, YouTube, DuckDuckGo, Bing

**Code Tools**: GitHub Code, GitHub Repos, Stack Overflow, MDN Web Docs, NPM

**AI Assistants**: ChatGPT, Claude, Perplexity, ArXiv

**Social Media**: LinkedIn, Twitter/X, Reddit

**Shopping**: Amazon

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Admin Authentication**: Firebase Auth + Supabase verification
- **Origin Allowlist**: Extension bridge validates message origins
- **Input Validation**: Zod schemas for all forms
- **Secure Storage**: Icons stored in Supabase with access policies
- **HTTPS Only**: All API communications encrypted

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=your-admin-email@example.com
```

### Build Commands

```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Post-Deployment Checklist

- [ ] Update `ALLOWED_ORIGINS` in extension content script with production URL
- [ ] Verify Supabase RLS policies are active
- [ ] Test admin login with production Firebase
- [ ] Verify platform catalog loads correctly
- [ ] Test extension bridge connection

## 👨‍💻 Developer

**Ibrahim Uzun** - Individual Chrome Extension Developer

- Based in Istanbul, Turkey
- Focus on privacy-first browser extensions
- Available for contact through Chrome Web Store or social media

## 📱 Extension Features Overview

Right Click Search Extension provides:

- **🔍 Smart Right-Click Search**: Select any text and right-click to search across multiple engines
- **🖼️ Powerful Image Search**: Right-click images for reverse image search
- **📑 Tab-Based Organization**: Separate tabs for text and image search engines
- **⚙️ Customizable Engines**: Add unlimited custom search engines
- **🔒 Privacy-First**: All data stays in your browser

---

Built with ❤️ for users who want powerful, beautiful browser extensions that respect their privacy.
