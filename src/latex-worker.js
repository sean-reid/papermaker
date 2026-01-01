// LaTeX compilation worker - hardcodes random citations

function gnuplotToTikz(gnuplotCommands) {
  const lines = gnuplotCommands.split('\n')
  let xlabel = 'X', ylabel = 'Y', plotType = 'line'
  
  for (const line of lines) {
    const xlabelMatch = line.match(/set xlabel "(.*)"/)
    if (xlabelMatch) xlabel = xlabelMatch[1]
    const ylabelMatch = line.match(/set ylabel "(.*)"/)
    if (ylabelMatch) ylabel = ylabelMatch[1]
    if (line.includes('graphtype scatter')) plotType = 'scatter'
    if (line.includes('graphtype bargraph')) plotType = 'bar'
  }
  
  const seed = Math.abs(gnuplotCommands.split('').reduce((a,c) => a + c.charCodeAt(0), 0))
  let rng = seed
  const rand = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff
    return rng / 0x7fffffff
  }
  
  const width = '\\columnwidth', height = '4.5cm'
  
  if (plotType === 'scatter') {
    const points = []
    for (let i = 0; i < 50; i++) {
      points.push(`(${(rand() * 100).toFixed(1)},${(rand() * 100 + Math.sin(rand() * 10) * 20).toFixed(1)})`)
    }
    return `\\begin{tikzpicture}
  \\begin{axis}[width=${width},height=${height},xlabel={\\small ${xlabel}},ylabel={\\small ${ylabel}},only marks,mark=*,mark size=0.8pt,tick label style={font=\\scriptsize}]
  \\addplot coordinates {${points.join(' ')}};
  \\end{axis}
\\end{tikzpicture}`
  } else if (plotType === 'bar') {
    const bars = []
    for (let i = 0; i < 8; i++) {
      bars.push(`(${i},${(10 + rand() * 80).toFixed(1)})`)
    }
    return `\\begin{tikzpicture}
  \\begin{axis}[width=${width},height=${height},ybar,xlabel={\\small ${xlabel}},ylabel={\\small ${ylabel}},xtick=data,bar width=6pt,tick label style={font=\\scriptsize}]
  \\addplot[fill=black!20] coordinates {${bars.join(' ')}};
  \\end{axis}
\\end{tikzpicture}`
  } else {
    const points = []
    for (let i = 0; i < 12; i++) {
      points.push(`(${i},${(20 + rand() * 60 + Math.sin(i * 0.5) * 15).toFixed(1)})`)
    }
    return `\\begin{tikzpicture}
  \\begin{axis}[width=${width},height=${height},xlabel={\\small ${xlabel}},ylabel={\\small ${ylabel}},grid=major,tick label style={font=\\scriptsize}]
  \\addplot[black,thick] coordinates {${points.join(' ')}};
  \\end{axis}
\\end{tikzpicture}`
  }
}

self.onmessage = async (e) => {
  if (e.data.type === 'compile-latex') {
    try {
      const { latex, graphData, bibliography } = e.data
      
      let modifiedLatex = latex
      
      // Add TikZ packages
      if (!modifiedLatex.includes('\\usepackage{tikz}')) {
        modifiedLatex = modifiedLatex.replace('\\usepackage{epsfig}', 
          '\\usepackage{tikz}\n\\usepackage{pgfplots}\n\\pgfplotsset{compat=1.18}')
      }
      
      // Replace figures with TikZ plots
      modifiedLatex = modifiedLatex.replace(/\\centerline\{\\epsfig\{figure=([^,}]+)[^}]*\}\}/g,
        (match, figFile) => {
          const tikz = (graphData && graphData[figFile]) ? gnuplotToTikz(graphData[figFile]) :
            `\\begin{tikzpicture}\\node[draw,minimum width=8cm,minimum height=5cm]{${figFile}};\\end{tikzpicture}`
          return `\\begin{center}\n${tikz}\n\\end{center}`
        }
      )
      
      // Hardcode random citation numbers instead of relying on bibtex
      const bibEntryCount = bibliography ? (bibliography.match(/@\w+\{/g) || []).length : 0
      
      if (bibEntryCount > 0) {
        // Replace \cite{} commands
        modifiedLatex = modifiedLatex.replace(/\\cite\{[^}]+\}/g, () => {
          const numCites = 1 + Math.floor(Math.random() * Math.min(3, bibEntryCount))
          const cites = []
          for (let i = 0; i < numCites; i++) {
            const randomNum = 1 + Math.floor(Math.random() * bibEntryCount)
            if (!cites.includes(randomNum)) {
              cites.push(randomNum)
            }
          }
          cites.sort((a, b) => a - b)
          return `~[${cites.join(',')}]`
        })
        
        // Also replace any literal "cite:X" text that escaped
        modifiedLatex = modifiedLatex.replace(/cite:\d+/g, () => {
          const randomNum = 1 + Math.floor(Math.random() * bibEntryCount)
          return `[${randomNum}]`
        })
      }
      
      // Count how many figures we have
      const figureCount = (modifiedLatex.match(/\\begin\{figure\}/g) || []).length
      
      if (figureCount > 0) {
        // Replace ALL \ref{fig:...} and \ref{dia:...} with random figure numbers
        modifiedLatex = modifiedLatex.replace(/\\ref\{(fig|dia):[^}]+\}/g, () => {
          const randomFig = 1 + Math.floor(Math.random() * figureCount)
          return randomFig.toString()
        })
        
        // Also replace any remaining \ref{} in case there are other patterns
        modifiedLatex = modifiedLatex.replace(/\\ref\{[^}]+\}/g, () => {
          const randomFig = 1 + Math.floor(Math.random() * figureCount)
          return randomFig.toString()
        })
      }
      
      const resources = [{ main: true, content: modifiedLatex }]
      
      // Add bibliography using \bibitem format (works without bibtex)
      if (bibliography && bibliography.trim().length > 0) {
        // Convert BibTeX to \bibitem
        const entries = bibliography.split(/(?=@)/g).filter(e => e.trim())
        const bibItems = []
        
        for (const entry of entries) {
          const labelMatch = entry.match(/@\w+\{([^,]+),/)
          if (!labelMatch) continue
          
          const label = labelMatch[1].trim()
          const authorMatch = entry.match(/author\s*=\s*\{([^}]+)\}/)
          const titleMatch = entry.match(/title\s*=\s*\{([^}]+)\}/)
          const yearMatch = entry.match(/year\s*=\s*\{?(\d+)\}?/)
          const journalMatch = entry.match(/journal\s*=\s*\{([^}]+)\}/)
          const booktitleMatch = entry.match(/booktitle\s*=\s*\{([^}]+)\}/)
          
          const author = authorMatch ? authorMatch[1] : 'Unknown Author'
          const title = titleMatch ? titleMatch[1] : 'Untitled'
          const year = yearMatch ? yearMatch[1] : '2024'
          const venue = journalMatch ? journalMatch[1] : (booktitleMatch ? booktitleMatch[1] : 'Technical Report')
          
          bibItems.push(`\\bibitem{${label}} ${author}. ${title}. {\\em ${venue}}, ${year}.`)
        }
        
        const bibItemsText = bibItems.join('\n\n')
        
        // Replace bibliography commands with embedded bibitems
        const patterns = [
          /\\begin\{footnotesize\}\s*\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}\s*\\end\{footnotesize\}/,
          /\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}/
        ]
        
        for (const pattern of patterns) {
          if (pattern.test(modifiedLatex)) {
            modifiedLatex = modifiedLatex.replace(
              pattern,
              `\\begin{footnotesize}\n\\begin{thebibliography}{99}\n${bibItemsText}\n\\end{thebibliography}\n\\end{footnotesize}`
            )
            break
          }
        }
        
        resources[0].content = modifiedLatex
      }
      
      const response = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: resources
        })
      })
      
      if (!response.ok) throw new Error(`Compilation failed: ${response.status}`)
      
      const pdfArrayBuffer = await response.arrayBuffer()
      const bytes = new Uint8Array(pdfArrayBuffer)
      
      if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
        throw new Error('Invalid PDF')
      }
      
      self.postMessage({
        type: 'pdf-compiled',
        pdfData: pdfArrayBuffer
      }, [pdfArrayBuffer])
      
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message })
    }
  }
}
