# PaperMaker

A web-based implementation of SCIGen that generates random computer science papers with **real LaTeX compilation** - complete with rendered math, figures, and proper formatting.

## Features

- **Faithful SCIGen Algorithm**: Rust/WASM port of the original Perl implementation  
- **Real LaTeX Compilation**: Uses LaTeX.Online service for authentic pdflatex output
- **Full LaTeX Support**: Math equations, figures, bibliographies - everything renders properly
- **Minimal UI**: Clean, simple interface

## How It Works

1. **Generate LaTeX**: Rust/WASM generates perfect LaTeX using SCIGen's grammar
2. **Compile to PDF**: LaTeX.Online service compiles with real pdflatex
3. **View/Download**: Proper PDF with math rendering and figures

## Installation

### Prerequisites
- Node.js 18+
- Rust with wasm-pack: `cargo install wasm-pack`

### Build
```bash
npm install
npm run build:wasm
npm run build
```

Output goes to `docs/` for GitHub Pages deployment.

## Development
```bash
npm run dev
```

## Usage

1. Enter author names and system name
2. Click "Generate Paper"
3. LaTeX is generated instantly, then sent to LaTeX.Online for compilation
4. View the real PDF with all math and figures rendered (~5 seconds)
5. Download PDF or LaTeX source

## Technical Stack

- **Backend**: Rust/WASM for SCIGen grammar expansion
- **LaTeX Compilation**: LaTeX.Online free service (real pdflatex)
- **Frontend**: React + Vite

## Notes

- Requires internet connection for PDF compilation
- LaTeX.Online is a free service - please don't abuse it
- For offline use, download the .tex file and compile locally

## Credits

- Original SCIGen: Jeremy Stribling, Max Krohn, Dan Aguayo (MIT CSAIL)
- LaTeX.Online: Free LaTeX compilation service
- This implementation: Rust/WASM SCIGen integration

## License

GNU GPL v2.0 (same as original SCIgen)
