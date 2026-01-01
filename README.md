# PaperMaker

Generate random computer science papers using SCIGen with LaTeX compilation to PDF.

## Quick Start

```bash
npm install
npm run build:wasm
npm run dev
```

## Building for Production

```bash
npm run build:wasm
npm run build
```

This creates the `docs/` directory with all assets.

## GitHub Pages Deployment

**After building**, commit the `docs/` directory and push to GitHub.

In GitHub Settings → Pages:
- Source: "Deploy from a branch"  
- Branch: "main"
- Folder: "/docs"

The `.nojekyll` file is included to prevent Jekyll processing.

## PDF Compilation

Uses **latex.ytotech.com** - a free LaTeX compilation service with CORS support. Works in both development and production with no configuration needed.

## Credits

Original SCIGen by Jeremy Stribling, Max Krohn, Dan Aguayo (MIT CSAIL)

## License

GNU GPL v2.0
