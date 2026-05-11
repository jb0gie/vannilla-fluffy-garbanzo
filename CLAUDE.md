# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Three.js-based 3D web experience called "TechShaman's Interdimensional Portal" - a single-file HTML application that creates an interactive 3D environment with floating text, animated models, and post-processing effects.

## Development Commands

### Local Development
```bash
# Start local development server (uses PORT environment variable)
npm run start

# Alternative: Use http-server directly
npx http-server ./ --port 8080 --no-dotfiles --no-cors --no-cache --no-logs
```

### Deployment
- **Coolify**: Uses `coolify.yaml` with nginx or http-server configuration
- **Nixpacks**: Uses `nixpacks.toml` for Node.js 18 deployment
- Single-file deployment: Just upload `index.html` and assets

## Architecture & Structure

### Core Architecture
- **Single-file architecture**: All application logic is contained in `index.html`
- **No build system**: Pure vanilla JavaScript, no bundlers or transpilers
- **CDN-based dependencies**: Three.js, Tailwind CSS, fonts loaded from CDNs
- **Asset structure**:
  - `models/` - 3D model files
  - `images/` - Image assets
  - `metadata/` - Configuration/metadata files
  - `schizodio/` - Separate project/directory with its own contracts and JSON data

### Key Technologies
- **Three.js** - 3D graphics engine
- **Tailwind CSS** - Utility-first CSS framework (loaded via CDN)
- **Post-processing effects** - Visual enhancements for 3D scene
- **WebGL** - Hardware-accelerated 3D rendering

### Project Structure
The repository maintains a simple structure with the main application in `index.html`, a concept version at `concept_index.html`, and the `schizodio/` subdirectory containing what appears to be a separate StarkNet-based project with contract artifacts.

### Important Notes
- **Loading performance**: The site intentionally takes time to load due to 3D asset loading
- **Responsive design**: Works across devices using Tailwind's responsive utilities
- **No state management**: Uses vanilla JavaScript without frameworks
- **Public domain license**: Code is released into the public domain