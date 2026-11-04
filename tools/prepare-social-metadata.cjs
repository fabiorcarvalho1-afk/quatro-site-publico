const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const apply = process.argv.includes('--apply');
const excluded = /^(admin(?:[-.]|$)|portal(?:[-.]|$)|franquia-(?:area|acesso)|parceiros-(?:area|acesso)|sistema-api|escopo-site-sistema|variacoes-visuais)/;
const escape = value => String(value || '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const catalog = JSON.parse(fs.readFileSync(path.join(root,'content/courses.json'),'utf8')).catalog.courses;
const paths = fs.readdirSync(root).filter(name=>name.endsWith('.html')).concat(...['en','es','intercambio'].filter(name=>fs.existsSync(path.join(root,name))).map(name=>fs.readdirSync(path.join(root,name)).filter(file=>file.endsWith('.html')).map(file=>name+'/'+file))).filter(file=>!excluded.test(path.basename(file)));

(async()=>{
  let browser;
  try {
    const entries = paths.map(file=>{
      const bytes=fs.readFileSync(path.join(root,file)), html=bytes.toString('utf8');
      if(!Buffer.from(html,'utf8').equals(bytes))throw new Error('Encoding review required: '+file);
      return {file,html};
    });
    browser=await chromium.launch({headless:true,executablePath:process.env.TEST_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
    const page=await browser.newPage();
    await page.route('**/*',route=>route.abort());
    const records=await page.evaluate(entries=>entries.map(({file,html})=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      if(!doc.querySelector('main'))return null;
      const meta=name=>doc.querySelector(`meta[property="${name}"],meta[name="${name}"]`)?.content || '';
      const main=doc.querySelector('main');
      const images=[...main.querySelectorAll('img[src]')].filter(image=>!/(?:logo|icon|badge)/i.test(image.getAttribute('src'))).map(image=>({url:image.getAttribute('src'),alt:image.alt}));
      const posters=[...main.querySelectorAll('video[poster]')].map(video=>({url:video.getAttribute('poster'),alt:video.getAttribute('aria-label') || ''}));
      const backgrounds=[...main.querySelectorAll('[style]')].map(element=>({url:element.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1],alt:element.getAttribute('aria-label') || ''})).filter(image=>image.url);
      return {file,title:meta('og:title') || doc.title || main.querySelector('h1')?.textContent,description:meta('og:description') || meta('description') || main.querySelector('p:not(.eyebrow):not([class*="kicker"])')?.textContent,
        canonical:doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),locale:doc.documentElement.lang,images:[{url:meta('og:image'),alt:meta('og:image:alt')},...posters,...images,...backgrounds],hasSharedScript:[...doc.scripts].some(script=>/(?:^|\/)script\.js(?:\?|$)/.test(script.getAttribute('src') || ''))};
    }).filter(Boolean),entries);
    const report=[];
    for(const record of records){
      const entry=entries.find(item=>item.file===record.file);
      const newline=entry.html.includes('\r\n')?'\r\n':'\n';
      const campaignPages=['chef-profissional-setembro-2026.html','confeitaria-profissional-setembro-2026.html','aulas-tematicas-experiencias.html','festa-infantil-gastronomica-experiencia.html'];
      const campaign=campaignPages.includes(record.file);
      const canonical=campaign?(record.canonical?.startsWith('https://cursos.quatrofolhasgastronomia.com.br/')?record.canonical:'https://cursos.quatrofolhasgastronomia.com.br/'+record.file.replace(/\.html$/,'')):'https://quatrofolhasgastronomia.com.br/'+(record.file==='index.html'?'':record.file);
      const matchingCourses=catalog.filter(item=>item.href===record.file);
      const course=matchingCourses.length===1?matchingCourses[0]:null;
      const clean=value=>String(value || '').replace(/\s+/g,' ').trim();
      const titleOverrides={'politica-de-cookies.html':'Política de Cookies | Quatro Folhas','politica-de-privacidade.html':'Política de Privacidade | Quatro Folhas'};
      const title=titleOverrides[record.file] || clean(record.title).replace(/^./,letter=>letter.toUpperCase());
      const description=clean(record.description || 'Conheça a Quatro Folhas Escola de Gastronomia.').slice(0,300);
      const candidates=[...(course?[{url:course.image,alt:course.alt}]:[]),...record.images];
      let image;
      for(const candidate of candidates){
        if(!candidate.url)continue;
        let url;
        try{url=new URL(candidate.url,canonical);}catch{continue;}
        if(url.hostname==='rascunho.quatrofolhasgastronomia.com.br')url.hostname='quatrofolhasgastronomia.com.br';
        if(url.protocol!=='https:' || !/\.(?:png|jpe?g|webp)$/i.test(url.pathname))continue;
        if(!['quatrofolhasgastronomia.com.br','www.quatrofolhasgastronomia.com.br','cursos.quatrofolhasgastronomia.com.br','rascunho.quatrofolhasgastronomia.com.br'].includes(url.host))continue;
        const local=path.resolve(root,'.'+decodeURIComponent(url.pathname));
        if(!local.startsWith(root+path.sep)||!fs.existsSync(local))continue;
        image={url:url.href,alt:clean(candidate.alt || title)};break;
      }
      if(!image)image={url:'https://quatrofolhasgastronomia.com.br/assets/photos/cozinha-escola-horizontal.png',alt:'Cozinha equipada da Quatro Folhas'};
      const tags=[
        '<!-- WhatsApp and social preview -->',
        '<meta name="qf:sharing" content="public">',
        `<link rel="canonical" href="${escape(canonical)}">`,
        '<meta property="og:type" content="website">',
        `<meta property="og:locale" content="${/^en/i.test(record.locale)?'en_US':/^es/i.test(record.locale)?'es_ES':'pt_BR'}">`,
        '<meta property="og:site_name" content="Quatro Folhas Escola de Gastronomia">',
        `<meta property="og:title" content="${escape(title)}">`,
        `<meta property="og:description" content="${escape(description)}">`,
        `<meta property="og:url" content="${escape(canonical)}">`,
        `<meta property="og:image" content="${escape(image.url)}">`,
        `<meta property="og:image:alt" content="${escape(image.alt)}">`,
        '<meta name="twitter:card" content="summary_large_image">',
        `<meta name="twitter:title" content="${escape(title)}">`,
        `<meta name="twitter:description" content="${escape(description)}">`,
        `<meta name="twitter:image" content="${escape(image.url)}">`,
        '<!-- End social preview -->'
      ].join(newline);
      let html=entry.html.replace(/<!-- WhatsApp and social preview -->[\s\S]*?<!-- End social preview -->\r?\n?/g,'');
      html=html.replace(/<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,tag=>/\b(?:property|name)\s*=\s*(?:"(?:og:|twitter:)[^"]*"|'(?:og:|twitter:)[^']*')/i.test(tag)?'':tag);
      html=html.replace(/<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,tag=>/\brel\s*=\s*["']canonical["']/i.test(tag)?'':tag);
      html=html.replace(/<\/head>/i,tags+newline+'</head>');
      html=html.replace(/^[\s\S]*?<\/head>/i,head=>head.replace(/^[\t ]+(?=\r?$)/gm,''));
      html=html.replace(/\bsrc=(["'])((?:\.\.?\/)*(?:script|courses-loader|thematic-loader)\.js)(?:\?[^"']*)?\1/g,(_match,quote,src)=>`src=${quote}${src}?v=20261029-share-1${quote}`);
      if(!record.hasSharedScript && !/src=["'][^"']*share\.js/.test(html)){
        const prefix='../'.repeat(record.file.split('/').length-1);
        html=html.replace(/<\/body>/i,`<script src="${prefix}share.js?v=20261029-1" defer></script>${newline}</body>`);
      }
      if(apply && html!==entry.html)fs.writeFileSync(path.join(root,record.file),html);
      report.push({file:record.file,title,image:image.url,changed:html!==entry.html});
    }
    console.log(JSON.stringify({mode:apply?'applied':'preview',pages:report.length,records:report}));
  } finally {await browser?.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
