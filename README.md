# PaperMaker

Generate random computer science papers using SCIGen with LaTeX compilation to PDF.

## Features

- **SCIGen Algorithm**: Faithful Rust/WASM port of the original
- **Perfect LaTeX**: All grammar rules preserved exactly  
- **PDF Compilation**: Uses LaTeX.Online for real pdflatex rendering
- **Full Support**: Math equations, figures, proper formatting

## Installation

```bash
npm install
npm run build:wasm
npm run dev
```

## Development - CORS Note

LaTeX.Online API requires CORS headers. For development:

**Option 1**: Use browser extension to disable CORS (e.g., "CORS Unblock" for Chrome)

**Option 2**: Just download the LaTeX and compile locally:
```bash
pdflatex paper.tex
bibtex paper
pdflatex paper.tex
pdflatex paper.tex
```

**Production**: When deployed to GitHub Pages, CORS works automatically.

## Usage

1. Enter author names and system name
2. Click "Generate Paper"
3. LaTeX generated instantly
4. PDF compiled via LaTeX.Online (~5-10 seconds)
5. View or download

## Production Build

```bash
npm run build
```

Outputs to `docs/` for GitHub Pages deployment.

## Credits

Original SCIGen by Jeremy Stribling, Max Krohn, Dan Aguayo (MIT CSAIL)

## License

GNU GPL v2.0
