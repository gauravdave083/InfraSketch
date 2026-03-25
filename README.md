# InfraSketch

A modern cloud architecture diagramming tool built with React and React Flow. Create beautiful infrastructure diagrams with AWS, Azure, and GCP services.

## Features

- 🎨 **Premium UI Design** - Glassmorphism design with smooth animations
- ☁️ **80+ Cloud Services** - AWS, Azure, and GCP icons
- � **AWS Container Support** - VPC, Subnets, Security Groups, and Regions
- �🔄 **Multiple Connection Types** - Animated, dotted, and solid lines
- 📐 **Smart Canvas** - Zoom, pan, and snap-to-grid
- 💾 **Export Options** - JSON, PNG, PDF, and SVG
- 🎯 **Bidirectional Arrows** - Arrows follow connection direction
- 🔒 **Container Controls** - Enable/disable containers for nested access
- ⚡ **Fast & Responsive** - Built with Vite and React 19

## Container Features

- **Resizable Containers** - Resize from all edges and corners
- **Nested Containers** - Place containers inside other containers
- **Smart Z-Index** - Automatic layering for nested containers
- **Click-Through Mode** - Disable containers to access nested elements
- **Connection Toggle** - Enable/disable connection handles per container

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

This is a **frontend-only application** ready for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy!

Or use Vercel CLI:

```bash
vercel
```

## Tech Stack

- React 19 + Vite
- React Flow for canvas
- Zustand for state management
- Tailwind CSS for styling
- Lucide React for icons
