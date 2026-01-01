let wasmModule = null
let rulesText = null
let graphRulesText = null

// Load WASM module
async function initWasm() {
  try {
    // Use import.meta.url to get proper base path
    const wasmUrl = new URL('../wasm/scigen_wasm.js', import.meta.url)
    const module = await import(wasmUrl.href)
    await module.default()
    wasmModule = module
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message })
  }
}

// Load rules file
async function loadRules() {
  try {
    // Load main rules
    const rulesUrl = new URL('../scirules.txt', import.meta.url)
    const response = await fetch(rulesUrl.href)
    rulesText = await response.text()
    
    // Load graph rules
    const graphUrl = new URL('../graphviz.in', import.meta.url)
    const graphResponse = await fetch(graphUrl.href)
    graphRulesText = await graphResponse.text()
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message })
  }
}

// Initialize on worker start
Promise.all([initWasm(), loadRules()]).then(() => {
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
      
      // Extract citation labels from LaTeX - handle all edge cases
      const citeMatches = latex.matchAll(/\\cite\{([^}]+)\}/g)
      const allCites = [...citeMatches].map(m => m[1])
      
      // Split comma-separated citations, trim whitespace, remove any remaining spaces
      const citeLabels = [...new Set(
        allCites.flatMap(c => 
          c.split(',')
           .map(l => l.trim())
           .map(l => l.replace(/\s+/g, ''))
           .filter(l => l.length > 0)
        )
      )]
      
      // Sort labels to ensure consistent ordering
      citeLabels.sort()
      
      
      // Generate bibliography entries for ALL citations found
      let bibliography = ''
      const generatedLabels = new Set()
      
      for (const label of citeLabels) {
        if (generatedLabels.has(label)) continue
        
        const citeSeed = BigInt(seed + generatedLabels.size * 100)
        const entry = wasmModule.generate_bibtex_entry(
          citeSeed,
          label,
          sysname,
          rulesText
        )
        bibliography += entry + '\n\n'
        generatedLabels.add(label)
      }
      
      
      // Generate graph data for each figure
      const figureMatches = latex.matchAll(/\\epsfig\{figure=([^,}]+)/g)
      const figureFiles = [...figureMatches].map(m => m[1])
      
      const graphData = {}
      if (graphRulesText) {
        for (let i = 0; i < figureFiles.length; i++) {
          const figSeed = BigInt(seed + i * 1000)
          const gnuplotCommands = wasmModule.generate_graph_data(figSeed, graphRulesText + '\n' + rulesText)
          graphData[figureFiles[i]] = gnuplotCommands
        }
      }
      
      self.postMessage({
        type: 'paper-generated',
        latex,
        graphData,
        bibliography: bibliography || ''  // Ensure it's never undefined
      })
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message
      })
    }
  }
}
