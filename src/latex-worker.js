// LaTeX compilation worker - hardcodes random citations

function gnuplotToTikz(gnuplotCommands, isDiagram = false) {
  const lines = gnuplotCommands.split('\n');
  let xlabel = 'X', ylabel = 'Y', plotType = 'line';
  let hasGraphType = false;
  
  for (const line of lines) {
    const xlabelMatch = line.match(/set xlabel "(.*)"/);
    if (xlabelMatch) xlabel = xlabelMatch[1];
    const ylabelMatch = line.match(/set ylabel "(.*)"/);
    if (ylabelMatch) ylabel = ylabelMatch[1];
    if (line.includes('graphtype scatter')) {
      plotType = 'scatter';
      hasGraphType = true;
    }
    if (line.includes('graphtype bargraph')) {
      plotType = 'bar';
      hasGraphType = true;
    }
  }
  
  // If it's a diagram file but has no real graphtype, make it a flowchart
  if (isDiagram && !hasGraphType) {
    return generateFlowchartDiagram(Math.abs(gnuplotCommands.split('').reduce((a,c) => a + c.charCodeAt(0), 0)));
  }
  
  const seed = Math.abs(gnuplotCommands.split('').reduce((a,c) => a + c.charCodeAt(0), 0));
  let rng = seed;
  const rand = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };
  
  const width = '0.95\\columnwidth', height = '5cm';
  
  const commonStyle = [
    'axis line style={black}',
    'tick style={black}',
    'tick label style={font=\\scriptsize}',
    'xlabel style={font=\\small}',
    'ylabel style={font=\\small}',
    'grid style={black!10, thin}'
  ].join(',');
  
  if (plotType === 'scatter') {
    const points = [];
    for (let i = 0; i < 50; i++) {
      points.push(`(${(rand() * 100).toFixed(1)},${(rand() * 100 + Math.sin(rand() * 10) * 20).toFixed(1)})`);
    }
    return `\\begin{tikzpicture}
  \\begin{axis}[
    width=${width},
    height=${height},
    xlabel={${xlabel}},
    ylabel={${ylabel}},
    ${commonStyle}
  ]
  \\addplot[black, only marks, mark=*, mark size=1.5pt] coordinates {${points.join(' ')}};
  \\end{axis}
\\end{tikzpicture}`;
  } else if (plotType === 'bar') {
    const bars = [];
    for (let i = 0; i < 8; i++) {
      bars.push(`(${i},${(10 + rand() * 80).toFixed(1)})`);
    }
    return `\\begin{tikzpicture}
  \\begin{axis}[
    width=${width},
    height=${height},
    xlabel={${xlabel}},
    ylabel={${ylabel}},
    ${commonStyle},
    ybar,
    xtick=data,
    bar width=6pt
  ]
  \\addplot[fill=black!15, draw=black] coordinates {${bars.join(' ')}};
  \\end{axis}
\\end{tikzpicture}`;
  } else {
    // For diagrams, use a flowchart-style representation
    if (isDiagram) {
      return generateFlowchartDiagram(seed);
    }
    
    const points = [];
    for (let i = 0; i < 12; i++) {
      points.push(`(${i},${(20 + rand() * 60 + Math.sin(i * 0.5) * 15).toFixed(1)})`);
    }
    return `\\begin{tikzpicture}
  \\begin{axis}[
    width=${width},
    height=${height},
    xlabel={${xlabel}},
    ylabel={${ylabel}},
    ${commonStyle},
    grid=major
  ]
  \\addplot[black, thick, mark=none] coordinates {${points.join(' ')}};
  \\end{axis}
\\end{tikzpicture}`;
  }
}

function generateFlowchartDiagram(seed) {
  // Generate a system architecture flowchart diagram
  let rng = seed;
  const rand = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };
  
  const components = ['Client', 'Server', 'Database', 'Cache', 'API', 'Storage', 'Network', 'Kernel', 'Module'];
  const numNodes = 3 + Math.floor(rand() * 3); // 3-5 nodes
  const selectedComponents = [];
  
  for (let i = 0; i < numNodes; i++) {
    selectedComponents.push(components[Math.floor(rand() * components.length)]);
  }
  
  let tikz = `\\begin{tikzpicture}[
  node/.style={rectangle, draw, thick, minimum width=2.2cm, minimum height=1cm, align=center, font=\\small},
  arrow/.style={->, >=stealth, thick}
]\n`;
  
  // Layout nodes hierarchically
  if (numNodes === 3) {
    tikz += `  \\node[node] (n0) at (0,0) {${selectedComponents[0]}};
  \\node[node] (n1) at (-2.5,-2) {${selectedComponents[1]}};
  \\node[node] (n2) at (2.5,-2) {${selectedComponents[2]}};
  
  \\draw[arrow] (n0) -- (n1);
  \\draw[arrow] (n0) -- (n2);
  \\draw[arrow] (n1) -- (n2);\n`;
  } else if (numNodes === 4) {
    tikz += `  \\node[node] (n0) at (0,0) {${selectedComponents[0]}};
  \\node[node] (n1) at (-2.5,-2) {${selectedComponents[1]}};
  \\node[node] (n2) at (2.5,-2) {${selectedComponents[2]}};
  \\node[node] (n3) at (0,-4) {${selectedComponents[3]}};
  
  \\draw[arrow] (n0) -- (n1);
  \\draw[arrow] (n0) -- (n2);
  \\draw[arrow] (n1) -- (n3);
  \\draw[arrow] (n2) -- (n3);\n`;
  } else {
    tikz += `  \\node[node] (n0) at (0,0) {${selectedComponents[0]}};
  \\node[node] (n1) at (-3,-2) {${selectedComponents[1]}};
  \\node[node] (n2) at (0,-2) {${selectedComponents[2]}};
  \\node[node] (n3) at (3,-2) {${selectedComponents[3]}};
  \\node[node] (n4) at (0,-4) {${selectedComponents[4]}};
  
  \\draw[arrow] (n0) -- (n1);
  \\draw[arrow] (n0) -- (n2);
  \\draw[arrow] (n0) -- (n3);
  \\draw[arrow] (n1) -- (n4);
  \\draw[arrow] (n2) -- (n4);
  \\draw[arrow] (n3) -- (n4);\n`;
  }
  
  tikz += '\\end{tikzpicture}';
  return tikz;
}

function generateSimpleDiagram() {
  return `\\begin{tikzpicture}[
  node/.style={rectangle, draw, thick, minimum width=2.2cm, minimum height=1cm, align=center, font=\\small},
  arrow/.style={->, >=stealth, thick}
]
  \\node[node] (sys) at (0,0) {System};
  \\node[node] (comp1) at (-2.5,-2) {Component\\\\A};
  \\node[node] (comp2) at (2.5,-2) {Component\\\\B};
  \\node[node] (comp3) at (0,-4) {Component\\\\C};
  
  \\draw[arrow] (sys) -- (comp1);
  \\draw[arrow] (sys) -- (comp2);
  \\draw[arrow] (comp1) -- (comp3);
  \\draw[arrow] (comp2) -- (comp3);
\\end{tikzpicture}`;
}

self.onmessage = async (e) => {
  if (e.data.type === 'compile-latex') {
    try {
      const { latex, graphData, bibliography } = e.data;
      
      let modifiedLatex = latex;
      
      if (!modifiedLatex.includes('\\usepackage{tikz}')) {
        modifiedLatex = modifiedLatex.replace('\\usepackage{epsfig}', 
          '\\usepackage{tikz}\n\\usepackage{pgfplots}\n\\pgfplotsset{compat=1.18}');
      }
      
      // Replace figures with TikZ
      modifiedLatex = modifiedLatex.replace(/\\centerline\{\\epsfig\{figure=([^,}]+)[^}]*\}\}/g,
        (match, figFile) => {
          let tikz;
          
          if (graphData && graphData[figFile]) {
            const data = graphData[figFile];
            const isDiagram = figFile.startsWith('dia');
            tikz = gnuplotToTikz(data, isDiagram);
          } else {
            tikz = `\\begin{tikzpicture}\\node[draw,minimum width=8cm,minimum height=5cm]{${figFile}};\\end{tikzpicture}`;
          }
          
          return `\\begin{center}\n${tikz}\n\\end{center}`;
        }
      );
      
      // Hardcode random citation numbers
      const bibEntryCount = bibliography ? (bibliography.match(/@\w+\{/g) || []).length : 0;
      
      if (bibEntryCount > 0) {
        modifiedLatex = modifiedLatex.replace(/\\cite\{[^}]+\}/g, () => {
          const numCites = 1 + Math.floor(Math.random() * Math.min(3, bibEntryCount));
          const cites = [];
          for (let i = 0; i < numCites; i++) {
            const randomNum = 1 + Math.floor(Math.random() * bibEntryCount);
            if (!cites.includes(randomNum)) {
              cites.push(randomNum);
            }
          }
          cites.sort((a, b) => a - b);
          return `~[${cites.join(',')}]`;
        });
        
        modifiedLatex = modifiedLatex.replace(/cite:\d+/g, () => {
          const randomNum = 1 + Math.floor(Math.random() * bibEntryCount);
          return `[${randomNum}]`;
        });
      }
      
      const figureCount = (modifiedLatex.match(/\\begin\{figure\}/g) || []).length;
      
      if (figureCount > 0) {
        modifiedLatex = modifiedLatex.replace(/\\ref\{(fig|dia):[^}]+\}/g, () => {
          const randomFig = 1 + Math.floor(Math.random() * figureCount);
          return randomFig.toString();
        });
        
        modifiedLatex = modifiedLatex.replace(/\\ref\{[^}]+\}/g, () => {
          const randomFig = 1 + Math.floor(Math.random() * figureCount);
          return randomFig.toString();
        });
      }
      
      const resources = [{ main: true, content: modifiedLatex }];
      
      if (bibliography && bibliography.trim().length > 0) {
        const entries = bibliography.split(/(?=@)/g).filter(e => e.trim());
        const bibItems = [];
        
        for (const entry of entries) {
          const labelMatch = entry.match(/@\w+\{([^,]+),/);
          if (!labelMatch) continue;
          
          const label = labelMatch[1].trim();
          const authorMatch = entry.match(/author\s*=\s*\{([^}]+)\}/);
          const titleMatch = entry.match(/title\s*=\s*\{([^}]+)\}/);
          const yearMatch = entry.match(/year\s*=\s*\{?(\d+)\}?/);
          const journalMatch = entry.match(/journal\s*=\s*\{([^}]+)\}/);
          const booktitleMatch = entry.match(/booktitle\s*=\s*\{([^}]+)\}/);
          
          const author = authorMatch ? authorMatch[1] : 'Unknown Author';
          const title = titleMatch ? titleMatch[1] : 'Untitled';
          const year = yearMatch ? yearMatch[1] : '2024';
          const venue = journalMatch ? journalMatch[1] : (booktitleMatch ? booktitleMatch[1] : 'Technical Report');
          
          bibItems.push(`\\bibitem{${label}} ${author}. ${title}. {\\em ${venue}}, ${year}.`);
        }
        
        const bibItemsText = bibItems.join('\n\n');
        
        const patterns = [
          /\\begin\{footnotesize\}\s*\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}\s*\\end\{footnotesize\}/,
          /\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}/
        ];
        
        for (const pattern of patterns) {
          if (pattern.test(modifiedLatex)) {
            modifiedLatex = modifiedLatex.replace(
              pattern,
              `\\begin{footnotesize}\n\\begin{thebibliography}{99}\n${bibItemsText}\n\\end{thebibliography}\n\\end{footnotesize}`
            );
            break;
          }
        }
        
        resources[0].content = modifiedLatex;
      }
      
      const response = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: resources
        })
      });
      
      if (!response.ok) throw new Error(`Compilation failed: ${response.status}`);
      
      const pdfArrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(pdfArrayBuffer);
      
      if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
        throw new Error('Invalid PDF');
      }
      
      self.postMessage({
        type: 'pdf-compiled',
        pdfData: pdfArrayBuffer
      }, [pdfArrayBuffer]);
      
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};
