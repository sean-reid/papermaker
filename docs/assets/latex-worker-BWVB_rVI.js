(function(){"use strict";function M(d){const b=d.split(`
`);let r="X",a="Y",e="line";for(const i of b){const t=i.match(/set xlabel "(.*)"/);t&&(r=t[1]);const o=i.match(/set ylabel "(.*)"/);o&&(a=o[1]),i.includes("graphtype scatter")&&(e="scatter"),i.includes("graphtype bargraph")&&(e="bar")}let l=Math.abs(d.split("").reduce((i,t)=>i+t.charCodeAt(0),0));const s=()=>(l=l*1103515245+12345&2147483647,l/2147483647),h="0.95\\columnwidth",f="5cm",c=["axis line style={black}","tick style={black}","tick label style={font=\\scriptsize}","xlabel style={font=\\small}","ylabel style={font=\\small}","grid style={black!10, thin}"].join(",");if(e==="scatter"){const i=[];for(let t=0;t<50;t++)i.push(`(${(s()*100).toFixed(1)},${(s()*100+Math.sin(s()*10)*20).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[
    width=${h},
    height=${f},
    xlabel={${r}},
    ylabel={${a}},
    ${c}
  ]
  \\addplot[black, only marks, mark=*, mark size=1.5pt] coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else if(e==="bar"){const i=[];for(let t=0;t<8;t++)i.push(`(${t},${(10+s()*80).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[
    width=${h},
    height=${f},
    xlabel={${r}},
    ylabel={${a}},
    ${c},
    ybar,
    xtick=data,
    bar width=6pt
  ]
  \\addplot[fill=black!15, draw=black] coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else{const i=[];for(let t=0;t<12;t++)i.push(`(${t},${(20+s()*60+Math.sin(t*.5)*15).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[
    width=${h},
    height=${f},
    xlabel={${r}},
    ylabel={${a}},
    ${c},
    grid=major
  ]
  \\addplot[black, thick, mark=none] coordinates {${i.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}}self.onmessage=async d=>{if(d.data.type==="compile-latex")try{const{latex:b,graphData:r,bibliography:a}=d.data;let e=b;e.includes("\\usepackage{tikz}")||(e=e.replace("\\usepackage{epsfig}",`\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}`)),e=e.replace(/\\centerline\{\\epsfig\{figure=([^,}]+)[^}]*\}\}/g,(i,t)=>`\\begin{center}
${r&&r[t]?M(r[t]):`\\begin{tikzpicture}\\node[draw,minimum width=8cm,minimum height=5cm]{${t}};\\end{tikzpicture}`}
\\end{center}`);const g=a?(a.match(/@\w+\{/g)||[]).length:0;g>0&&(e=e.replace(/\\cite\{[^}]+\}/g,()=>{const i=1+Math.floor(Math.random()*Math.min(3,g)),t=[];for(let o=0;o<i;o++){const p=1+Math.floor(Math.random()*g);t.includes(p)||t.push(p)}return t.sort((o,p)=>o-p),`~[${t.join(",")}]`}),e=e.replace(/cite:\d+/g,()=>`[${1+Math.floor(Math.random()*g)}]`));const l=(e.match(/\\begin\{figure\}/g)||[]).length;l>0&&(e=e.replace(/\\ref\{(fig|dia):[^}]+\}/g,()=>(1+Math.floor(Math.random()*l)).toString()),e=e.replace(/\\ref\{[^}]+\}/g,()=>(1+Math.floor(Math.random()*l)).toString()));const s=[{main:!0,content:e}];if(a&&a.trim().length>0){const i=a.split(/(?=@)/g).filter(n=>n.trim()),t=[];for(const n of i){const m=n.match(/@\w+\{([^,]+),/);if(!m)continue;const w=m[1].trim(),u=n.match(/author\s*=\s*\{([^}]+)\}/),y=n.match(/title\s*=\s*\{([^}]+)\}/),k=n.match(/year\s*=\s*\{?(\d+)\}?/),$=n.match(/journal\s*=\s*\{([^}]+)\}/),x=n.match(/booktitle\s*=\s*\{([^}]+)\}/),z=u?u[1]:"Unknown Author",j=y?y[1]:"Untitled",F=k?k[1]:"2024",T=$?$[1]:x?x[1]:"Technical Report";t.push(`\\bibitem{${w}} ${z}. ${j}. {\\em ${T}}, ${F}.`)}const o=t.join(`

`),p=[/\\begin\{footnotesize\}\s*\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}\s*\\end\{footnotesize\}/,/\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}/];for(const n of p)if(n.test(e)){e=e.replace(n,`\\begin{footnotesize}
\\begin{thebibliography}{99}
${o}
\\end{thebibliography}
\\end{footnotesize}`);break}s[0].content=e}const h=await fetch("https://latex.ytotech.com/builds/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({compiler:"pdflatex",resources:s})});if(!h.ok)throw new Error(`Compilation failed: ${h.status}`);const f=await h.arrayBuffer(),c=new Uint8Array(f);if(!(c[0]===37&&c[1]===80&&c[2]===68&&c[3]===70))throw new Error("Invalid PDF");self.postMessage({type:"pdf-compiled",pdfData:f},[f])}catch(b){self.postMessage({type:"error",error:b.message})}}})();
