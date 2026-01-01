(function(){"use strict";function M(d){const b=d.split(`
`);let s="X",o="Y",t="line";for(const i of b){const e=i.match(/set xlabel "(.*)"/);e&&(s=e[1]);const n=i.match(/set ylabel "(.*)"/);n&&(o=n[1]),i.includes("graphtype scatter")&&(t="scatter"),i.includes("graphtype bargraph")&&(t="bar")}let c=Math.abs(d.split("").reduce((i,e)=>i+e.charCodeAt(0),0));const r=()=>(c=c*1103515245+12345&2147483647,c/2147483647),l="\\columnwidth",h="4.5cm";if(t==="scatter"){const i=[];for(let e=0;e<50;e++)i.push(`(${(r()*100).toFixed(1)},${(r()*100+Math.sin(r()*10)*20).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[width=${l},height=${h},xlabel={\\small ${s}},ylabel={\\small ${o}},only marks,mark=*,mark size=0.8pt,tick label style={font=\\scriptsize}]
  \\addplot coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else if(t==="bar"){const i=[];for(let e=0;e<8;e++)i.push(`(${e},${(10+r()*80).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[width=${l},height=${h},ybar,xlabel={\\small ${s}},ylabel={\\small ${o}},xtick=data,bar width=6pt,tick label style={font=\\scriptsize}]
  \\addplot[fill=black!20] coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else{const i=[];for(let e=0;e<12;e++)i.push(`(${e},${(20+r()*60+Math.sin(e*.5)*15).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[width=${l},height=${h},xlabel={\\small ${s}},ylabel={\\small ${o}},grid=major,tick label style={font=\\scriptsize}]
  \\addplot[black,thick] coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}}self.onmessage=async d=>{if(d.data.type==="compile-latex")try{const{latex:b,graphData:s,bibliography:o}=d.data;let t=b;t.includes("\\usepackage{tikz}")||(t=t.replace("\\usepackage{epsfig}",`\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}`)),t=t.replace(/\\centerline\{\\epsfig\{figure=([^,}]+)[^}]*\}\}/g,(e,n)=>`\\begin{center}
${s&&s[n]?M(s[n]):`\\begin{tikzpicture}\\node[draw,minimum width=8cm,minimum height=5cm]{${n}};\\end{tikzpicture}`}
\\end{center}`);const m=o?(o.match(/@\w+\{/g)||[]).length:0;m>0&&(t=t.replace(/\\cite\{[^}]+\}/g,()=>{const e=1+Math.floor(Math.random()*Math.min(3,m)),n=[];for(let p=0;p<e;p++){const f=1+Math.floor(Math.random()*m);n.includes(f)||n.push(f)}return n.sort((p,f)=>p-f),`~[${n.join(",")}]`}),t=t.replace(/cite:\d+/g,()=>`[${1+Math.floor(Math.random()*m)}]`));const c=(t.match(/\\begin\{figure\}/g)||[]).length;c>0&&(t=t.replace(/\\ref\{(fig|dia):[^}]+\}/g,()=>(1+Math.floor(Math.random()*c)).toString()),t=t.replace(/\\ref\{[^}]+\}/g,()=>(1+Math.floor(Math.random()*c)).toString()));const r=[{main:!0,content:t}];if(o&&o.trim().length>0){const e=o.split(/(?=@)/g).filter(a=>a.trim()),n=[];for(const a of e){const g=a.match(/@\w+\{([^,]+),/);if(!g)continue;const z=g[1].trim(),u=a.match(/author\s*=\s*\{([^}]+)\}/),y=a.match(/title\s*=\s*\{([^}]+)\}/),k=a.match(/year\s*=\s*\{?(\d+)\}?/),$=a.match(/journal\s*=\s*\{([^}]+)\}/),x=a.match(/booktitle\s*=\s*\{([^}]+)\}/),w=u?u[1]:"Unknown Author",j=y?y[1]:"Untitled",F=k?k[1]:"2024",T=$?$[1]:x?x[1]:"Technical Report";n.push(`\\bibitem{${z}} ${w}. ${j}. {\\em ${T}}, ${F}.`)}const p=n.join(`

`),f=[/\\begin\{footnotesize\}\s*\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}\s*\\end\{footnotesize\}/,/\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}/];for(const a of f)if(a.test(t)){t=t.replace(a,`\\begin{footnotesize}
\\begin{thebibliography}{99}
${p}
\\end{thebibliography}
\\end{footnotesize}`);break}r[0].content=t}const l=await fetch("https://latex.ytotech.com/builds/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({compiler:"pdflatex",resources:r})});if(!l.ok)throw new Error(`Compilation failed: ${l.status}`);const h=await l.arrayBuffer(),i=new Uint8Array(h);if(!(i[0]===37&&i[1]===80&&i[2]===68&&i[3]===70))throw new Error("Invalid PDF");self.postMessage({type:"pdf-compiled",pdfData:h},[h])}catch(b){self.postMessage({type:"error",error:b.message})}}})();
