let wasmModule = null
let rulesText = null

// Load WASM module
async function initWasm() {
  try {
    const wasmUrl = new URL('/wasm/scigen_wasm.js', self.location.origin)
    const module = await import(wasmUrl.href)
    await module.default()
    wasmModule = module
    console.log('WASM module loaded')
  } catch (error) {
    console.error('Failed to load WASM:', error)
    self.postMessage({ type: 'error', error: error.message })
  }
}

// Load rules file
async function loadRules() {
  try {
    const response = await fetch('/scirules.txt')
    rulesText = await response.text()
    console.log('Rules loaded:', rulesText.length, 'bytes')
  } catch (error) {
    console.error('Failed to load rules:', error)
    self.postMessage({ type: 'error', error: error.message })
  }
}

// Initialize on worker start
Promise.all([initWasm(), loadRules()]).then(() => {
  console.log('Worker initialized')
})

self.onmessage = async (e) => {
  if (e.data.type === 'generate-paper') {
    try {
      if (!wasmModule || !rulesText) {
        self.postMessage({ 
          type: 'error', 
          error: 'WASM or rules not loaded yet' 
        })
        return
      }

      const { seed, author1, author2, sysname } = e.data
      
      // Convert seed to BigInt for u64
      const seedBigInt = BigInt(seed)
      
      // Generate LaTeX
      const latex = wasmModule.generate_paper(
        seedBigInt,
        author1,
        author2,
        sysname,
        rulesText
      )
      
      self.postMessage({
        type: 'paper-generated',
        latex
      })
    } catch (error) {
      console.error('Error generating paper:', error)
      self.postMessage({
        type: 'error',
        error: error.message
      })
    }
  }
}
