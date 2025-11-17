# Right Click Search Extension

<p align="center">
  <img src="public/banner.png" alt="Right Click Search Logo" width="400" style="margin: 64px 0; display: block;">
</p>

A powerful, customizable right-click search extension with modern design. Transform any selected text or image into instant search results across multiple search engines.

## 📱 Screenshots

| Extension Popup                      | Context Menu                             |
| ------------------------------------ | ---------------------------------------- |
| ![Extension Popup](public/popup.png) | ![Context Menu](public/context-menu.png) |

## 🚀 Core Features

### 🔍 **Smart Right-Click Search**

- **Text Search**: Select any text → Right-click → Choose search engine → Instant results
- **Image Search**: Right-click any image → Search by image across supported engines
- **Context-Aware**: Different search options for text vs images
- **Multi-Engine Support**: Add unlimited custom search engines

### 🎯 **Tab-Based Organization**

- **Text Search Tab**: Manage text-based search engines (Google, YouTube, GitHub, etc.)
- **Image Search Tab**: Manage image search engines (Google Reverse Image, etc.)
- **Independent Scroll**: Each tab remembers its own scroll position
- **Clean Separation**: No confusion between text and image searches

### ⚡ **Advanced User Experience**

- **Floating Action Button**: One-click engine addition with smart defaults
- **Inline Editing**: Click any field to edit directly
- **Auto-Focus**: New engines automatically focus title field
- **Inline Delete Confirmation**: "Are you sure?" with ✓/✕ buttons
- **Real-time Sync**: Changes instantly appear in context menu
- **Import/Export**: Backup and restore your search configurations

### 🛠 **Technical Excellence**

- ⚡️ **Vite 7** - Lightning fast build tool with advanced HMR
- 🔒 **TypeScript 5** - Full type safety with latest features
- ⚛️ **React 19** - Latest React with modern hooks and concurrent features
- 🎨 **TailwindCSS 3.4** - Utility-first CSS framework with custom design system
- 🎭 **Framer Motion** - Premium animations and transitions
- 📦 **Manifest V3** - Modern Chrome extension standard
- 🔧 **Chrome Storage API** - Persistent data with cross-device sync

## 📖 How It Works

### 🎯 **Quick Start**

1. **Install Extension**: Load the built extension in Chrome
2. **Open Settings**: Click extension icon → Configure search engines
3. **Add Engines**: Use floating + button to add new search engines
4. **Start Searching**: Select text/image → Right-click → Choose engine

### 🔍 **Search Engine Configuration**

- **URL Pattern**: Use `%s` as placeholder for search term
- **Context Type**: Choose between 'selection' (text) or 'image'
- **Title**: Display name in context menu
- **Enable/Disable**: Toggle visibility in right-click menu

### 📱 **User Interface**

- **Popup**: Main configuration interface
- **Tabs**: Separate text and image search engines
- **Cards**: Each search engine as an editable card
- **FAB**: Quick add button (floating action button)
- **Menu**: Export/Import settings (hamburger menu)

### 🎨 **Design Philosophy**

- **Modern Design**: Glassmorphism and modern aesthetics
- **Minimalist**: Clean, uncluttered interface
- **Accessible**: Keyboard navigation and screen reader support
- **Responsive**: Works on all screen sizes
- **Fast**: Optimized animations and interactions

## 📦 Installation

### Prerequisites

- **Node.js** 18+ or **Bun** (recommended)
- **Chrome** browser for testing

### Setup Steps

1. **Clone Repository**

```bash
git clone <repository-url>
cd right-click-search-extension
```

2. **Install Dependencies**

```bash
# Using Bun (recommended - faster)
bun install

# Or using npm
npm install
```

3. **Start Development**

```bash
# Development with HMR
bun dev

# Or build for production
bun build
```

4. **Load Extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build` folder
   - Extension is ready! 🎉

## 🛠️ Development

### Available Scripts

- `bun dev` - Start development server with HMR
- `bun build` - Build for production
- `bun build:watch` - Build and watch for changes
- `bun build:firefox` - Build for Firefox
- `bun dev:firefox` - Start Firefox development server
- `bun lint` - Run ESLint
- `bun lint:fix` - Fix ESLint issues
- `bun prettier` - Format code

### Project Structure

```
├── src/
│   ├── components/        # React components
│   │   ├── search/        # Search engine related components
│   │   │   ├── SearchEngineCard.tsx    # Individual engine card
│   │   │   └── IconPicker.tsx          # Icon selection (removed)
│   │   └── views/         # Main UI views
│   │       └── Main.tsx   # Primary configuration interface
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   │   └── useSearchEngines.ts         # Search engine management
│   ├── lib/               # Core utilities
│   │   ├── config.ts      # Extension configuration
│   │   ├── defaultSearchEngines.ts     # Default engine data
│   │   └── utils.ts       # Utility functions
│   ├── pages/             # Extension entry points
│   │   ├── background/    # Context menu management
│   │   │   └── index.ts   # ContextMenuManager class
│   │   └── popup/         # Extension popup
│   ├── shared/            # Shared utilities
│   │   └── storages/      # Chrome storage managers
│   │       └── searchEnginesStorage.ts # Engine persistence
│   ├── styles/            # Global styles
│   └── types/             # TypeScript definitions
│       └── search.ts      # Search engine types
├── public/                # Static assets and icons
├── utils/                 # Build tools and utilities
└── build/                 # Production build output
```

## 🛠️ Build & Deployment

### Quick Build

```bash
# Development
bun dev

# Production build
bun build
```

### Automated Build Script

The included `build.sh` script provides one-command building and packaging:

```bash
# Build and create versioned zip file
bash build.sh
```

**Features:**

- Automatic package manager detection (Bun/npm)
- Version extraction from package.json
- Timestamped zip files
- Clean build artifacts
- Cross-platform compatibility

**Output:** `right-click-search-v0.0.1-20250116.zip`

## 🔧 Customization

### Adding New Search Engines

1. Open extension popup
2. Click floating + button
3. Configure:
   - **Title**: Display name
   - **URL**: Search URL with `%s` placeholder
   - **Context**: 'selection' (text) or 'image'

### Example Custom Engines

```javascript
// GitHub Search
{
  title: "Search GitHub",
  url: "https://github.com/search?q=%s",
  contexts: ["selection"]
}

// Stack Overflow
{
  title: "Search Stack Overflow",
  url: "https://stackoverflow.com/search?q=%s",
  contexts: ["selection"]
}
```

### Configuration Files

- **`manifest.js`**: Extension permissions and metadata
- **`src/lib/defaultSearchEngines.ts`**: Default search engines
- **`tailwind.config.ts`**: Design system customization

## 🎯 Usage Examples

### Text Search

1. Select text on any webpage
2. Right-click → "Right Click Search"
3. Choose search engine (YouTube, Google, etc.)
4. Results open in new tab

### Image Search

1. Right-click any image
2. Choose "Search Image on Google"
3. Reverse image search opens

### Managing Engines

- **Add**: Floating + button
- **Edit**: Click any field in engine card
- **Delete**: Click delete → "Are you sure?" → ✓
- **Toggle**: Switch to enable/disable
- **Import/Export**: Hamburger menu

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-search-engine`)
3. Add your search engine to `defaultSearchEngines.ts`
4. Test thoroughly
5. Submit Pull Request

## 📈 Roadmap

- [ ] Keyboard shortcuts for quick search
- [ ] Search history and favorites
- [ ] Custom search engine templates
- [ ] Multi-language support
- [ ] Advanced context detection
- [ ] Search result preview

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Core Technologies

- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and HMR
- **[React](https://reactjs.org/)** - Modern UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animations
- **[Chrome Extensions API](https://developer.chrome.com/docs/extensions/)** - Extension platform
 
### Special Thanks

Built with ❤️ for developers who want powerful, beautiful browser extensions. Special thanks to the open-source community for the amazing tools that make this possible.
