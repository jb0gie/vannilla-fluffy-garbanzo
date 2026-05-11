# AGENTS.md

## Commands

### Development
```bash
npm run start                    # Start dev server on PORT env var
npx http-server ./ --port 8080 --no-dotfiles --no-cors --no-cache --no-logs
```

### Testing
```bash
# Manual test - open basic_test.html in browser
# No automated test runner configured
```

## Code Style Guidelines

### Architecture
- **Single-file architecture**: Main logic in index.html
- **ES6 modules**: Use import/export in js/ directory files
- **No build system**: Pure vanilla JavaScript, no bundlers
- **CDN dependencies**: Three.js, Tailwind CSS loaded from CDNs

### Imports
```javascript
// Three.js core
import * as THREE from 'three';

// Three.js addons
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Custom modules
import { initScene } from './scene.js';
```

### Naming Conventions
- `camelCase` for variables and functions
- `PascalCase` for classes (if used)
- Descriptive names with cyberpunk/theme context

### Error Handling
- Use console.log with emojis for debugging: `console.log('✓ Success')`
- Check for DOM element existence before manipulation
- Graceful fallbacks for missing assets

### Formatting
- No explicit formatter configured
- Follow existing 2-space indentation
- Consistent semicolon usage

### Key Technologies
- Three.js for 3D graphics
- Tailwind CSS via CDN
- WebGL/Canvas rendering
- ES6 modules only