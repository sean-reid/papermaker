import { useState, useEffect, useRef } from 'react'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)
  const [latexContent, setLatexContent] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [author1, setAuthor1] = useState('Jeremy Stribling')
  const [author2, setAuthor2] = useState('Maxwell Krohn')
  const [sysname, setSysname] = useState('TinyTeX')
  const [error, setError] = useState(null)
  
  const scigenWorkerRef = useRef(null)
  const latexWorkerRef = useRef(null)

  useEffect(() => {
    // Initialize SCIGen worker
    scigenWorkerRef.current = new Worker(
      new URL('./worker.js', import.meta.url),
      { type: 'module' }
    )

    scigenWorkerRef.current.onmessage = (e) => {
      if (e.data.type === 'paper-generated') {
        const latex = e.data.latex
        setLatexContent(latex)
        setIsLoading(false)
        
        // Automatically compile to PDF
        compileToPDF(latex)
      } else if (e.data.type === 'error') {
        console.error('SCIGen error:', e.data.error)
        setError('Failed to generate paper: ' + e.data.error)
        setIsLoading(false)
      }
    }

    // Initialize LaTeX compiler worker
    latexWorkerRef.current = new Worker(
      new URL('./latex-worker.js', import.meta.url),
      { type: 'module' }
    )

    latexWorkerRef.current.onmessage = (e) => {
      if (e.data.type === 'pdf-compiled') {
        // Create blob directly from ArrayBuffer
        const pdfBlob = new Blob([e.data.pdfData], { 
          type: 'application/pdf' 
        })
        const url = URL.createObjectURL(pdfBlob)
        setPdfUrl(url)
        setIsCompiling(false)
      } else if (e.data.type === 'error') {
        console.error('LaTeX compilation error:', e.data.error)
        // Show error but keep LaTeX available for download
        setError(e.data.error)
        setIsCompiling(false)
      }
    }

    return () => {
      if (scigenWorkerRef.current) {
        scigenWorkerRef.current.terminate()
      }
      if (latexWorkerRef.current) {
        latexWorkerRef.current.terminate()
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [])

  const generatePaper = () => {
    if (!scigenWorkerRef.current) return
    
    setIsLoading(true)
    setIsCompiling(false)
    setLatexContent(null)
    setError(null)
    
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
    
    const seed = Math.floor(Math.random() * 0xffffffff)
    
    scigenWorkerRef.current.postMessage({
      type: 'generate-paper',
      seed,
      author1,
      author2,
      sysname
    })
  }

  const compileToPDF = (latex) => {
    if (!latexWorkerRef.current) return
    
    setIsCompiling(true)
    latexWorkerRef.current.postMessage({
      type: 'compile-latex',
      latex
    })
  }

  const downloadLaTeX = () => {
    if (!latexContent) return
    
    const blob = new Blob([latexContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'paper.tex'
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    if (!pdfUrl) return
    
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = 'paper.pdf'
    link.click()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PaperMaker
          </h1>
          <p className="text-gray-600">
            Generate random computer science papers using SCIGen
          </p>
          <p className="text-sm text-gray-500 mt-1">
            With real LaTeX compilation and PDF preview
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Author
            </label>
            <input
              type="text"
              value={author1}
              onChange={(e) => setAuthor1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Second Author
            </label>
            <input
              type="text"
              value={author2}
              onChange={(e) => setAuthor2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Name
            </label>
            <input
              type="text"
              value={sysname}
              onChange={(e) => setSysname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <button
            onClick={generatePaper}
            disabled={isLoading || isCompiling}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating LaTeX...' : isCompiling ? 'Compiling PDF...' : 'Generate Paper'}
          </button>

          {error && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 whitespace-pre-wrap">
              {error}
            </div>
          )}
        </div>

        {pdfUrl && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">
              ✓ Paper compiled successfully with full LaTeX rendering
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={downloadLaTeX}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Download LaTeX
              </button>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Download PDF
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white" style={{ height: '800px' }}>
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Generated Paper PDF"
              />
            </div>
          </div>
        )}

        {latexContent && !pdfUrl && !isCompiling && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">LaTeX source generated. Compiling to PDF...</p>
            <button
              onClick={downloadLaTeX}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Download LaTeX Source
            </button>
          </div>
        )}

        {!latexContent && !isLoading && !error && (
          <div className="text-center text-gray-500 py-12">
            Click "Generate Paper" to create a new paper
          </div>
        )}
      </div>
    </div>
  )
}

export default App
