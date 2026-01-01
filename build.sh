#!/bin/bash
set -e

echo "Building PaperMaker..."

# Check for wasm-pack
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack not found. Install with: cargo install wasm-pack"
    exit 1
fi

# Build WASM
echo "Building Rust/WASM module..."
cd wasm
wasm-pack build --target web --out-dir ../public/wasm
cd ..

# Build frontend
echo "Building frontend..."
npm run build

echo "Build complete! Output in docs/ directory"
