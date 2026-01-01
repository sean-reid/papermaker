// LaTeX compilation using LaTeX.Online service
// This gives us real pdflatex output with full math and figure support

self.onmessage = async (e) => {
  if (e.data.type === 'compile-latex') {
    try {
      const { latex } = e.data
      
      // Use LaTeX.Online compilation service
      // This is a free service that compiles LaTeX to PDF using real pdflatex
      const response = await fetch('https://latexonline.cc/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(latex)}`
      })
      
      if (!response.ok) {
        throw new Error(`LaTeX compilation failed: ${response.statusText}`)
      }
      
      // Get PDF bytes
      const pdfBlob = await response.blob()
      const pdfBytes = await pdfBlob.arrayBuffer()
      
      self.postMessage({
        type: 'pdf-compiled',
        pdfBytes: Array.from(new Uint8Array(pdfBytes))
      })
    } catch (error) {
      console.error('LaTeX compilation error:', error)
      self.postMessage({
        type: 'error',
        error: error.message
      })
    }
  }
}
