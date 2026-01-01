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

// Capitalize the first letter of actual text, skipping all LaTeX commands
function capitalizeFirst(str) {
  let i = 0
  while (i < str.length) {
    const char = str[i]
    
    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }
    
    // Skip LaTeX commands (backslash followed by command)
    if (char === '\\') {
      i++
      // Skip command name
      while (i < str.length && /[a-zA-Z*]/.test(str[i])) {
        i++
      }
      // Skip everything until we find the closing brace if there's an opening brace
      if (i < str.length && str[i] === '{') {
        let braceDepth = 1
        i++
        while (i < str.length && braceDepth > 0) {
          if (str[i] === '{') braceDepth++
          if (str[i] === '}') braceDepth--
          i++
        }
      } else if (i < str.length && str[i] === ' ') {
        i++
      }
      continue
    }
    
    // Found actual text - capitalize if lowercase
    if (/[a-z]/.test(char)) {
      return str.slice(0, i) + char.toUpperCase() + str.slice(i + 1)
    }
    
    // Already uppercase or not a letter
    return str
  }
  
  return str
}

// Capitalize LaTeX content appropriately  
function capitalizeLaTeX(latex) {
  let result = latex
  
  // 1. Capitalize content inside \title{} only
  result = result.replace(/\\title\{([^}]+)\}/g, (match, title) => {
    // Just capitalize the first word of the title
    const words = title.split(/\s+/)
    if (words.length > 0 && /^[a-z]/.test(words[0])) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    }
    return `\\title{${words.join(' ')}}`
  })
  
  // 2. Capitalize section titles - just the first word
  result = result.replace(/\\((?:sub)*section)\*?\{([^}]+)\}/g, (match, cmd, content) => {
    const star = match.includes('*') ? '*' : ''
    const words = content.split(/\s+/)
    if (words.length > 0 && /^[a-z]/.test(words[0])) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    }
    return `\\${cmd}${star}{${words.join(' ')}}`
  })
  
  // 3. Capitalize after sentence endings (. ! ?)
  result = result.replace(/([.!?])(\s+)([a-z])/g, (match, punct, space, letter) => {
    const beforeIdx = result.indexOf(match)
    const before = result.substring(Math.max(0, beforeIdx - 20), beforeIdx)
    
    // Don't capitalize after abbreviations
    if (/\b(e\.g|i\.e|et al|vs|etc|Fig|fig|Dr|Mr|Mrs|Ms|cf)\s*$/.test(before)) {
      return match
    }
    
    // Don't capitalize after decimal numbers
    if (/\d+\.\s*$/.test(before)) {
      return match
    }
    
    return punct + space + letter.toUpperCase()
  })
  
  // 4. Capitalize first letter of paragraphs - but only actual text
  const lines = result.split('\n')
  let inParagraph = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Empty line - next non-empty is a new paragraph
    if (line === '') {
      inParagraph = false
      continue
    }
    
    // LaTeX command line - skip
    if (line.startsWith('\\')) {
      inParagraph = false
      continue  
    }
    
    // Start of a new paragraph - capitalize first actual letter
    if (!inParagraph) {
      lines[i] = capitalizeFirst(lines[i])
      inParagraph = true
    }
  }
  
  result = lines.join('\n')
  
  return result
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
      
      // Capitalize LaTeX content appropriately
      const capitalizedLatex = capitalizeLaTeX(latex)
      
      // Extract citation labels from LaTeX - handle all edge cases
      const citeMatches = capitalizedLatex.matchAll(/\\cite\{([^}]+)\}/g)
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
      const figureMatches = capitalizedLatex.matchAll(/\\epsfig\{figure=([^,}]+)/g)
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
        latex: capitalizedLatex,
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
