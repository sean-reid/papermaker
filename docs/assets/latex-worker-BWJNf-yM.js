(function(){"use strict";function M(f,l=!1){const h=f.split(`
`);let i="X",t="Y",a="line",s=!1;for(const e of h){const n=e.match(/set xlabel "(.*)"/);n&&(i=n[1]);const r=e.match(/set ylabel "(.*)"/);r&&(t=r[1]),e.includes("graphtype scatter")&&(a="scatter",s=!0),e.includes("graphtype bargraph")&&(a="bar",s=!0)}if(l&&!s)return m(Math.abs(f.split("").reduce((e,n)=>e+n.charCodeAt(0),0)));const p=Math.abs(f.split("").reduce((e,n)=>e+n.charCodeAt(0),0));let b=p;const d=()=>(b=b*1103515245+12345&2147483647,b/2147483647),u="0.95\\columnwidth",c="5cm",o=["axis line style={black}","tick style={black}","tick label style={font=\\scriptsize}","xlabel style={font=\\small}","ylabel style={font=\\small}","grid style={black!10, thin}"].join(",");if(a==="scatter"){const e=[];for(let n=0;n<50;n++)e.push(`(${(d()*100).toFixed(1)},${(d()*100+Math.sin(d()*10)*20).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[
    width=${u},
    height=${c},
    xlabel={${i}},
    ylabel={${t}},
    ${o}
  ]
  \\addplot[black, only marks, mark=*, mark size=1.5pt] coordinates {${e.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else if(a==="bar"){const e=[];for(let n=0;n<8;n++)e.push(`(${n},${(10+d()*80).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[
    width=${u},
    height=${c},
    xlabel={${i}},
    ylabel={${t}},
    ${o},
    ybar,
    xtick=data,
    bar width=6pt
  ]
  \\addplot[fill=black!15, draw=black] coordinates {${e.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}else{if(l)return m(p);const e=[];for(let n=0;n<12;n++)e.push(`(${n},${(20+d()*60+Math.sin(n*.5)*15).toFixed(1)})`);return`\\begin{tikzpicture}
  \\begin{axis}[
    width=${u},
    height=${c},
    xlabel={${i}},
    ylabel={${t}},
    ${o},
    grid=major
  ]
  \\addplot[black, thick, mark=none] coordinates {${e.join(" ")}};
  \\end{axis}
\\end{tikzpicture}`}}function m(f){let l=f;const h=()=>(l=l*1103515245+12345&2147483647,l/2147483647),i=["Client","Server","Database","Cache","API","Storage","Network","Kernel","Module"],t=3+Math.floor(h()*3),a=[];for(let p=0;p<t;p++)a.push(i[Math.floor(h()*i.length)]);let s=`\\begin{tikzpicture}[
  node/.style={rectangle, draw, thick, minimum width=2.2cm, minimum height=1cm, align=center, font=\\small},
  arrow/.style={->, >=stealth, thick}
]
`;return t===3?s+=`  \\node[node] (n0) at (0,0) {${a[0]}};
  \\node[node] (n1) at (-2.5,-2) {${a[1]}};
  \\node[node] (n2) at (2.5,-2) {${a[2]}};
  
  \\draw[arrow] (n0) -- (n1);
  \\draw[arrow] (n0) -- (n2);
  \\draw[arrow] (n1) -- (n2);
`:t===4?s+=`  \\node[node] (n0) at (0,0) {${a[0]}};
  \\node[node] (n1) at (-2.5,-2) {${a[1]}};
  \\node[node] (n2) at (2.5,-2) {${a[2]}};
  \\node[node] (n3) at (0,-4) {${a[3]}};
  
  \\draw[arrow] (n0) -- (n1);
  \\draw[arrow] (n0) -- (n2);
  \\draw[arrow] (n1) -- (n3);
  \\draw[arrow] (n2) -- (n3);
`:s+=`  \\node[node] (n0) at (0,0) {${a[0]}};
  \\node[node] (n1) at (-3,-2) {${a[1]}};
  \\node[node] (n2) at (0,-2) {${a[2]}};
  \\node[node] (n3) at (3,-2) {${a[3]}};
  \\node[node] (n4) at (0,-4) {${a[4]}};
  
  \\draw[arrow] (n0) -- (n1);
  \\draw[arrow] (n0) -- (n2);
  \\draw[arrow] (n0) -- (n3);
  \\draw[arrow] (n1) -- (n4);
  \\draw[arrow] (n2) -- (n4);
  \\draw[arrow] (n3) -- (n4);
`,s+="\\end{tikzpicture}",s}self.onmessage=async f=>{if(f.data.type==="compile-latex")try{const{latex:l,graphData:h,bibliography:i}=f.data;let t=l;t.includes("\\usepackage{tikz}")||(t=t.replace("\\usepackage{epsfig}",`\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}`)),t=t.replace(/\\centerline\{\\epsfig\{figure=([^,}]+)[^}]*\}\}/g,(c,o)=>{let e;if(h&&h[o]){const n=h[o],r=o.startsWith("dia");e=M(n,r)}else e=`\\begin{tikzpicture}\\node[draw,minimum width=8cm,minimum height=5cm]{${o}};\\end{tikzpicture}`;return`\\begin{center}
${e}
\\end{center}`});const a=i?(i.match(/@\w+\{/g)||[]).length:0;a>0&&(t=t.replace(/\\cite\{[^}]+\}/g,()=>{const c=1+Math.floor(Math.random()*Math.min(3,a)),o=[];for(let e=0;e<c;e++){const n=1+Math.floor(Math.random()*a);o.includes(n)||o.push(n)}return o.sort((e,n)=>e-n),`~[${o.join(",")}]`}),t=t.replace(/cite:\d+/g,()=>`[${1+Math.floor(Math.random()*a)}]`));const s=(t.match(/\\begin\{figure\}/g)||[]).length;s>0&&(t=t.replace(/\\ref\{(fig|dia):[^}]+\}/g,()=>(1+Math.floor(Math.random()*s)).toString()),t=t.replace(/\\ref\{[^}]+\}/g,()=>(1+Math.floor(Math.random()*s)).toString()));const p=[{main:!0,content:t}];if(i&&i.trim().length>0){const c=i.split(/(?=@)/g).filter(r=>r.trim()),o=[];for(const r of c){const g=r.match(/@\w+\{([^,]+),/);if(!g)continue;const z=g[1].trim(),w=r.match(/author\s*=\s*\{([^}]+)\}/),y=r.match(/title\s*=\s*\{([^}]+)\}/),$=r.match(/year\s*=\s*\{?(\d+)\}?/),k=r.match(/journal\s*=\s*\{([^}]+)\}/),x=r.match(/booktitle\s*=\s*\{([^}]+)\}/),j=w?w[1]:"Unknown Author",C=y?y[1]:"Untitled",T=$?$[1]:"2024",F=k?k[1]:x?x[1]:"Technical Report";o.push(`\\bibitem{${z}} ${j}. ${C}. {\\em ${F}}, ${T}.`)}const e=o.join(`

`),n=[/\\begin\{footnotesize\}\s*\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}\s*\\end\{footnotesize\}/,/\\bibliography\{[^}]+\}\s*\\bibliographystyle\{[^}]+\}/];for(const r of n)if(r.test(t)){t=t.replace(r,`\\begin{footnotesize}
\\begin{thebibliography}{99}
${e}
\\end{thebibliography}
\\end{footnotesize}`);break}p[0].content=t}const b=await fetch("https://latex.ytotech.com/builds/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({compiler:"pdflatex",resources:p})});if(!b.ok)throw new Error(`Compilation failed: ${b.status}`);const d=await b.arrayBuffer(),u=new Uint8Array(d);if(!(u[0]===37&&u[1]===80&&u[2]===68&&u[3]===70))throw new Error("Invalid PDF");self.postMessage({type:"pdf-compiled",pdfData:d},[d])}catch(l){self.postMessage({type:"error",error:l.message})}}})();
