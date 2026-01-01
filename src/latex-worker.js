// LaTeX compilation worker
// Uses latex.ytotech.com - free service with CORS support

self.onmessage = async (e) => {
  if (e.data.type === 'compile-latex') {
    try {
      const { latex } = e.data
      
      console.log('Compiling LaTeX using latex.ytotech.com...')
      
      // Use YtoTech LaTeX-on-HTTP service (supports CORS!)
      const response = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [
            {
              main: true,
              content: latex
            }
          ]
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Compilation failed:', errorText)
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
        throw new Error('LaTeX compilation failed - check console for details')
      }
      
      console.log('PDF compiled successfully:', pdfArrayBuffer.byteLength, 'bytes')
      
      self.postMessage({
        type: 'pdf-compiled',
        pdfData: pdfArrayBuffer
      }, [pdfArrayBuffer])
      
    } catch (error) {
      console.error('LaTeX compilation error:', error)
      self.postMessage({
        type: 'error',
        error: error.message
      })
    }
  }
}
