# Right Click Search - Monorepo

A Chrome extension and web platform for customizable right-click search engines, built with modern web technologies.

## 🏗️ Architecture

This monorepo contains two main applications:

- **Extension** (`apps/extension/`): Chrome extension for right-click search functionality
- **Web** (`apps/web/`): Next.js web platform for managing search engines and platforms

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd right-click-search-monorepo

# Install dependencies
bun install
```

### Development

```bash
# Start both apps in development mode
bun run dev

# Or start individually
bun run dev:web          # Next.js web app only
bun run dev:extension    # Chrome extension only
```

### Building

```bash
# Build all apps
bun run build

# Build individually
bun run build:web
bun run build:extension
```

## 📁 Project Structure

```
right-click-search-monorepo/
├── apps/
│   ├── extension/          # Chrome extension (Vite + React + TypeScript)
│   └── web/               # Next.js web platform
├── packages/
│   └── shared/            # Shared utilities and types (future use)
├── .cursor/
│   └── rules/             # Cursor AI assistant rules
├── tsconfig.base.json     # Base TypeScript configuration
├── package.json          # Root package.json with workspace scripts
└── .gitignore           # Unified gitignore for entire monorepo
```

## ✨ Features

### Core Functionality
- **🔍 Right-Click Search**: Search selected text or images using custom search engines
- **⌨️ Keyboard Shortcuts**: Quick search with customizable keyboard shortcuts
- **🎨 Custom Engines**: Add unlimited custom search engines with emoji/image icons
- **📦 Platform Catalog**: Browse and install pre-configured search platforms

### **🔄 Bidirectional Real-Time Sync** (NEW)
Extension and website stay in perfect sync, **in real-time**:
- ✅ Add a platform from website → Instantly available in extension
- ✅ Remove an engine from extension → Instantly reflected on website
- ✅ Changes sync **automatically** across all open tabs
- ✅ No refresh needed, fully reactive UI

[Learn more about Bidirectional Sync →](docs/bidirectional-sync.md)



## 🛠️ Development Scripts

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start both web and extension in development mode |
| `bun run build` | Build both web and extension for production |
| `bun run lint` | Run linting for both apps |
| `bun run type-check` | Run TypeScript type checking for both apps |
| `bun run clean` | Clean build artifacts from both apps |

### Web App Scripts (`apps/web/`)

| Script | Description |
|--------|-------------|
| `bun run dev:web` | Start Next.js development server |
| `bun run build:web` | Build Next.js for production |
| `bun run lint:web` | Run ESLint on web app |

### Extension Scripts (`apps/extension/`)

| Script | Description |
|--------|-------------|
| `bun run dev:extension` | Start extension with HMR |
| `bun run build:extension` | Build extension for Chrome |
| `bun run build:extension:firefox` | Build extension for Firefox |
| `bun run build:extension:watch` | Build extension with file watching |

## 🔧 Configuration

### Environment Variables

Each app manages its own environment variables:

- **Web App**: `apps/web/.env.local`
- **Extension**: `apps/extension/.env.local`

See `.env.example` for required environment variables.

### TypeScript

- **Base Config**: `tsconfig.base.json` (shared configuration)
- **Web App**: `apps/web/tsconfig.json` (extends base)
- **Extension**: `apps/extension/tsconfig.json` (extends base)

## 🧩 Cursor Rules

Development guidelines and best practices are defined in `.cursor/rules/`:

- `code-style.mdc` - Code style and conventions
- `development-workflow.mdc` - Development workflow and debugging
- `project-overview.mdc` - Project architecture and technologies
- `search-engine-feature.mdc` - Search engine implementation details
- `ui-design-system.mdc` - UI/UX design system
- `user-preferences.mdc` - User interaction preferences

## 🌐 Technologies

### Extension
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 3.4 + Framer Motion
- **Chrome APIs**: Context Menus, Storage, Tabs

### Web Platform
- **Framework**: Next.js 15 + React 19
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### Shared
- **Package Manager**: Bun
- **Linting**: ESLint
- **Type Checking**: TypeScript 5

## 🚀 Deployment

### Extension
1. Build the extension: `bun run build:extension`
2. Load `apps/extension/dist/` as unpacked extension in Chrome
3. Or package `dist/` folder for Chrome Web Store

### Web Platform
1. Build the web app: `bun run build:web`
2. Deploy `apps/web/out/` to your hosting provider
3. Configure environment variables on your platform

## 🤝 Contributing

1. Follow the Cursor Rules defined in `.cursor/rules/`
2. Use TypeScript strictly with proper type checking
3. Follow the established code style and patterns
4. Test changes in both apps before committing
5. Update documentation when adding new features

## 📝 License

This project is licensed under the terms specified in the extension directory.

## 🆘 Support

For questions or issues:

1. Check the Cursor Rules in `.cursor/rules/`
2. Review the project documentation in each app
3. Check existing issues and discussions
4. Create a new issue with detailed information

---

Built with ❤️ using modern web technologies and best practices.
