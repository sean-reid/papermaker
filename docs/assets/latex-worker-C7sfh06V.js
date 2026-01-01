(function(){"use strict";function M(d){const b=d.split(`
`);let s="X",o="Y",e="line";for(const i of b){const t=i.match(/set xlabel "(.*)"/);t&&(s=t[1]);const n=i.match(/set ylabel "(.*)"/);n&&(o=n[1]),i.includes("graphtype scatter")&&(e="scatter"),i.includes("graphtype bargraph")&&(e="bar")}let c=Math.abs(d.split("").reduce((i,t)=>i+t.charCodeAt(0),0));const r=()=>(c=c*1103515245+12345&2147483647,c/2147483647),l="\\columnwidth",h="4.5cm";if(e==="scatter"){const i=[];for(let t=0;t<50;t++)i.push(`(${(r()*100).toFixed(1)},${(r()*100+Math.sin(r()*10)*20).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[width=${l},height=${h},xlabel={\\small ${s}},ylabel={\\small ${o}},only marks,mark=*,mark size=0.8pt,tick label style={font=\\scriptsize}]
  \\addplot coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else if(e==="bar"){const i=[];for(let t=0;t<8;t++)i.push(`(${t},${(10+r()*80).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[width=${l},height=${h},ybar,xlabel={\\small ${s}},ylabel={\\small ${o}},xtick=data,bar width=6pt,tick label style={font=\\scriptsize}]
  \\addplot[fill=black!20] coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else{const i=[];for(let t=0;t<12;t++)i.push(`(${t},${(20+r()*60+Math.sin(t*.5)*15).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[width=${l},height=${h},xlabel={\\small ${s}},ylabel={\\small ${o}},grid=major,tick label style={font=\\scriptsize}]
  \\addplot[black,thick] coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}}self.onmessage=async d=>{if(d.data.type==="compile-latex")try{const{latex:b,graphData:s,bibliography:o}=d.data;let e=b;e.includes("\\usepackage{tikz}")||(e=e.replace("\\usepackage{epsfig}",`\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}`)),e=e.replace(/\\centerline\{\\epsfig\{figure=([^,}]+)[^}]*\}\}/g,(t,n)=>`\\begin{center}
${s&&s[n]?M(s[n]):`\\begin{tikzpicture}\\node[draw,minimum width=8cm,minimum height=5cm]{${n}};\\end{tikzpicture}`}
\\end{center}`);const g=o?(o.match(/@\w+\{/g)||[]).length:0;g>0&&(e=e.replace(/\\cite\{[^}]+\}/g,()=>{const t=1+Math.floor(Math.random()*Math.min(3,g)),n=[];for(let p=0;p<t;p++){const f=1+Math.floor(Math.random()*g);n.includes(f)||n.push(f)}return n.sort((p,f)=>p-f),`~[${n.join(",")}]`}));const c=(e.match(/\\begin\{figure\}/g)||[]).length;c>0&&(e=e.replace(/Figure\s*\?\?/g,()=>`Figure~${1+Math.floor(Math.random()*c)}`),e=e.replace(/\\ref\{[^}]*\?\?[^}]*\}/g,()=>`${1+Math.floor(Math.random()*c)}`));const r=[{main:!0,content:e}];if(o&&o.trim().length>0){const t=o.split(/(?=@)/g).filter(a=>a.trim()),n=[];for(const a of t){const u=a.match(/@\w+\{([^,]+),/);if(!u)continue;const z=u[1].trim(),m=a.match(/author\s*=\s*\{([^}]+)\}/),y=a.match(/title\s*=\s*\{([^}]+)\}/),$=a.match(/year\s*=\s*\{?(\d+)\}?/),k=a.match(/journal\s*=\s*\{([^}]+)\}/),x=a.match(/booktitle\s*=\s*\{([^}]+)\}/),w=m?m[1]:"Unknown Author",j=y?y[1]:"Untitled",F=$?$[1]:"2024",T=k?k[1]:x?x[1]:"Technical Report";n.push(`\\bibitem{${z}} ${w}. ${j}. {\\em ${T}}, ${F}.`)}const p=n.join(`

`),f=[/\\begin\{footnotesize\}\s*\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}\s*\\end\{footnotesize\}/,/\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}/];for(const a of f)if(a.test(e)){e=e.replace(a,`\\begin{footnotesize}
\\begin{thebibliography}{99}
${p}
\\end{thebibliography}
\\end{footnotesize}`);break}r[0].content=e}const l=await fetch("https://latex.ytotech.com/builds/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({compiler:"pdflatex",resources:r})});if(!l.ok)throw new Error(`Compilation failed: ${l.status}`);const h=await l.arrayBuffer(),i=new Uint8Array(h);if(!(i[0]===37&&i[1]===80&&i[2]===68&&i[3]===70))throw new Error("Invalid PDF");self.postMessage({type:"pdf-compiled",pdfData:h},[h])}catch(b){self.postMessage({type:"error",error:b.message})}}})();
