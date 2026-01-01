// LaTeX compilation worker
// Calls LaTeX.Online API directly

self.onmessage = async (e) => {
  if (e.data.type === 'compile-latex') {
    try {
      const { latex } = e.data
      
      // Direct POST to LaTeX.Online
      const formData = new FormData()
      formData.append('text', latex)
      
      const response = await fetch('https://latexonline.cc/compile', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }
      
      // Get PDF as ArrayBuffer
      const pdfArrayBuffer = await response.arrayBuffer()
      
      // Validate PDF magic bytes (%PDF)
      const bytes = new Uint8Array(pdfArrayBuffer)
      const isPDF = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
      
      if (!isPDF) {
        const text = new TextDecoder().decode(pdfArrayBuffer)
        console.error('Not a PDF:', text.substring(0, 200))
        throw new Error('LaTeX compilation failed')
      }
      
      console.log('PDF compiled:', pdfArrayBuffer.byteLength, 'bytes')
      
      self.postMessage({
        type: 'pdf-compiled',
        pdfData: pdfArrayBuffer
      }, [pdfArrayBuffer])
      
    } catch (error) {
      console.error('LaTeX compilation error:', error)
      
      // Provide helpful error message
      let errorMsg = error.message
      if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
        errorMsg = 'CORS Error: To enable PDF compilation in development, either:\n' +
                   '1. Use a browser extension to disable CORS (e.g., "CORS Unblock")\n' +
                   '2. Download the LaTeX and compile locally\n' +
                   '3. Deploy to production (GitHub Pages) where CORS works'
      }
      
      self.postMessage({
        type: 'error',
        error: errorMsg
      })
    }
  }
}
