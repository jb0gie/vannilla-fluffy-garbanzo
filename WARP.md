# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TechShaman's Interdimensional Portal is a self-contained 3D web experience built with Three.js. The entire application runs from a single HTML file (`index.html`) with no build process required - everything is vanilla JavaScript using CDN imports.

## Architecture

### Single-File Philosophy
- **Core Application**: `index.html` contains the entire 3D application (~950 lines)
- **No Build Tools**: Uses ES6 modules via importmap and CDN resources
- **Self-Contained**: All JavaScript is embedded directly in the HTML file

### Key Components
- **Three.js Scene**: 3D models, orbiting text, particles, asteroids, meteors
- **Model Loading**: GLTF models (`techshaman.glb`, `schwepe.vrm`) via GLTFLoader
- **Interactive Elements**: Clickable 3D text with descriptions, hover effects
- **Post-Processing**: Afterimage effects via EffectComposer
- **Animations**: TWEEN.js for smooth transitions and orbiting text

### Directory Structure
```
├── index.html          # Main application (self-contained)
├── models/            # 3D models (.glb, .vrm files)
├── images/            # Textures and backgrounds (.jpg, .png)
├── schizodio/         # NFT collection assets (restricted access)
├── hypcity/           # Additional project assets
├── metadata/          # Project metadata (restricted)
└── .well-known/       # Domain verification files
```

## Development Commands

### Local Development
```powershell
# Start development server
npm run start

# Alternative: Direct http-server usage
npx http-server ./ --port 3000 --no-dotfiles --no-cors --no-cache --no-logs --no-robots
```

### Testing
- No formal testing framework - manual browser testing required
- Test interactive elements: click 3D text, model interactions
- Verify loading performance and asset loading
- Check cross-device compatibility (desktop/mobile)

## Security Configuration

### Directory Protection
- **Restricted Directories**: `/schizodio/`, `/metadata/`, `/.git/`, `/models/`, `/hypcity/`
- **Security Files**: `.htaccess`, `robots.txt`, `nginx.conf`
- **Access Control**: HTTP server flags prevent directory listing

### Headers
- X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Referrer-Policy, Permissions-Policy restrictions
- Custom error pages redirect to main site

## Deployment

### Coolify/Nixpacks Deployment
- **Platform**: Uses Coolify with Nixpacks for automatic deployment
- **Configuration**: `nixpacks.toml`, `coolify.yaml`
- **SSL**: Automatic HTTPS via Let's Encrypt
- **Domain**: `techshaman.42024769.xyz`

### Docker Alternative
- Nginx Alpine container with custom `nginx.conf`
- Volume mounts for static files
- Security headers and access restrictions

## Asset Management

### 3D Models
- **Main Model**: `models/techshaman.glb` (10MB) - Central animated character
- **VRM Model**: `models/schwepe.vrm` (3.8MB) - Additional character model
- **Loading**: Managed by Three.js LoadingManager with progress tracking

### Textures
- **Background**: `images/space.jpg` (450KB)
- **Moon Texture**: `images/moon.jpg` (83KB) 
- **Jeff Cube**: `images/jeff.png` (31KB)

### Performance Considerations
- Large initial load due to 3D assets
- Loading screen with progress indicator
- Asset preloading via LoadingManager
- Post-processing effects may impact performance

## Code Patterns

### Three.js Initialization
- Scene setup with multiple light sources (point, ambient, directional)
- OrbitControls for camera manipulation
- Raycasting for interactive elements
- Animation mixer for model animations

### Text Rendering
- FontLoader for 3D text geometry
- Orbiting text with dynamic positioning
- Click interactions toggle description visibility
- Custom materials with emissive properties

### Animation System
- Single `animate()` loop using `requestAnimationFrame`
- TWEEN.js for smooth transitions
- Individual animation functions for different elements
- Clock-based timing for consistent animation

## Interactive Features

### Click Interactions
- **3D Text**: Click to show/hide descriptions and reposition camera
- **Jeff Cube**: Links to GitHub profile
- **TechShaman Model**: Resets camera to default position
- **Hover Effects**: Cursor changes and visual feedback

### Camera Controls
- OrbitControls with damping
- Zoom limits (30-100 units)
- Touch support for mobile devices
- Smooth transitions via TWEEN animations

## Development Guidelines

### Asset Optimization
- Compress 3D models before adding to `/models/`
- Optimize textures for web delivery
- Consider loading priorities for critical assets

### Code Organization
- Keep all JavaScript in the single HTML file
- Use ES6 modules via CDN imports
- Group related functionality in IIFE blocks
- Comment complex Three.js configurations

### Performance Monitoring
- Watch for memory leaks in animation loops
- Monitor WebGL context usage
- Test on lower-end devices
- Optimize geometry complexity when possible

## Common Tasks

### Adding New 3D Content
1. Place models in `/models/` directory
2. Add textures to `/images/` directory  
3. Load via appropriate Three.js loaders in the main script
4. Add to LoadingManager for progress tracking

### Modifying Animations
- Edit the main `animate()` function
- Use TWEEN.js for smooth transitions
- Update individual animation functions as needed
- Test performance impact of new animations

### Security Updates
- Modify `.htaccess` for Apache servers
- Update `nginx.conf` for Nginx deployments
- Adjust `robots.txt` for search engine restrictions
- Review directory access permissions