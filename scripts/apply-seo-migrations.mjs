import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = execFileSync('git', ['ls-files', '*.html'], {
  cwd: projectDir,
  encoding: 'utf8'
}).trim().split('\n').filter(Boolean);

const metadata = {
  'index.html': {
    title: 'Dimagrimento Lento | Nutrizioniste a Salerno, Angri e Nocera',
    description: 'Biologhe nutrizioniste a Salerno, Angri e Nocera. Percorsi personalizzati per dimagrire in modo graduale e sostenibile. Prima consulenza gratuita.'
  },
  'nutrizionista-angri/index.html': {
    title: 'Nutrizionista ad Angri | Dimagrimento Lento',
    description: 'Biologhe nutrizioniste ad Angri, in Corso Vittorio Emanuele 13. Percorsi personalizzati e prima consulenza gratuita. Scopri lo studio e prenota.'
  },
  'nutrizionista-salerno/index.html': {
    title: 'Nutrizionista a Salerno | Dimagrimento Lento',
    description: 'Biologhe nutrizioniste a Salerno, in Via Irno 2. Percorsi personalizzati, studio aperto fino alle 21 e prima consulenza gratuita. Scopri come prenotare.'
  },
  'nutrizionista-nocera/index.html': {
    title: 'Nutrizionista a Nocera Inferiore | Dimagrimento Lento',
    description: 'Biologhe nutrizioniste a Nocera Inferiore, in Via Attilio Barbarulo 105. Percorsi personalizzati e prima consulenza gratuita. Scopri lo studio.'
  },
  'testimonianze.html': {
    title: 'Testimonianze di dimagrimento | Dimagrimento Lento',
    description: 'Leggi e guarda le esperienze di chi ha seguito il percorso Dimagrimento Lento negli studi di Salerno, Angri e Nocera Inferiore.'
  },
  'recensioni/daniela-chionna-da-74-a-54-kg.html': {
    title: 'Da 74 a 54 kg: la storia di Daniela | Dimagrimento Lento',
    description: 'Daniela racconta il proprio percorso da 74 a 54 kg e l’esperienza con il metodo Dimagrimento Lento. Leggi la recensione completa.'
  },
  'recensioni/giuseppe-belvedere-23-kg-in-7-mesi.html': {
    title: '23 kg in 7 mesi: la storia di Giuseppe | Dimagrimento Lento',
    description: 'Giuseppe racconta il percorso con cui ha perso 23 kg in sette mesi, senza eliminare pizza e dolci. Leggi la sua esperienza completa.'
  },
  'recensioni/vincenzo-riccio-30-kg.html': {
    title: '30 kg persi: la storia di Vincenzo | Dimagrimento Lento',
    description: 'Vincenzo racconta come ha perso 30 kg con un percorso seguito passo dopo passo dal team di biologhe nutrizioniste.'
  },
  'recensioni/federica-dangelo-10-kg-in-3-mesi.html': {
    title: '10 kg in 3 mesi: la storia di Federica | Dimagrimento Lento',
    description: 'Federica racconta come ha perso 10 kg in meno di tre mesi con piani personalizzati e assistenza durante il percorso.'
  },
  'recensioni/valentina-pagano-anni-di-diete-e-poi-la-svolta.html': {
    title: 'Dopo anni di diete: Valentina | Dimagrimento Lento',
    description: 'Valentina racconta il passaggio dalle diete fallimentari a un percorso alimentare personalizzato e più sostenibile.'
  },
  'recensioni/ilaria-bartiromo-percorso-non-dieta.html': {
    title: 'Un percorso, non una dieta: Ilaria | Dimagrimento Lento',
    description: 'Ilaria racconta un percorso alimentare senza stress e sensi di colpa, costruito sulle proprie esigenze e abitudini.'
  },
  'videotestimonianze/2024/Ho-sconfitto-gli-attacchi-di-fame-che-mi-facevano-riprendere-tutto-il-peso-perso.html': {
    title: 'Attacchi di fame: la storia di Rosita | Dimagrimento Lento',
    description: 'Rosita racconta come ha imparato a riconoscere e gestire gli attacchi di fame durante il proprio percorso alimentare.'
  },
  'videotestimonianze/2024/a-31-anni-ho-scoperto-che-carboidrati-non-fanno-ingrassare.html': {
    title: 'Carboidrati: la storia di Chiara | Dimagrimento Lento',
    description: 'Chiara racconta come è cambiato il suo rapporto con i carboidrati e con l’alimentazione durante il percorso.'
  },
  'videotestimonianze/2024/ho-scoperto-che-non-era-fame-vera-ma-ansia.html': {
    title: 'Fame emotiva e ansia: Giovanna | Dimagrimento Lento',
    description: 'Giovanna racconta come ha imparato a distinguere la fame fisica da quella emotiva e a gestire meglio i momenti di ansia.'
  },
  'videotestimonianze/2024/ho-smesso-di-essere-vittima-delle-diete.html': {
    title: 'Uscire dal ciclo delle diete: Daniela | Dimagrimento Lento',
    description: 'Daniela racconta come ha cambiato il proprio rapporto con il cibo dopo anni di diete e risultati temporanei.'
  },
  'videotestimonianze/2024/Ho-smesso-di-chiamarle-diete-finalmente-ho-imparato-a-mangiare.html': {
    title: 'Imparare a mangiare: Stefania | Dimagrimento Lento',
    description: 'Stefania racconta il passaggio dalle diete fallimentari a un percorso alimentare più consapevole e sostenibile.'
  },
  'videotestimonianze/2024/a-67-anni-ho-smesso-di-credere-alle-diete-drastiche.html': {
    title: 'Diete drastiche: la storia di Olimpia | Dimagrimento Lento',
    description: 'Olimpia racconta come, a 67 anni, ha scelto un percorso graduale al posto delle diete drastiche seguite in passato.'
  }
};

function addReviewsLinks(html) {
  return html.replace(/<ul\b[^>]*>[\s\S]*?<\/ul>/g, (list) => {
    if (!list.includes('testimonianze.html') || list.includes('href="/recensioni/"')) return list;

    let item = '<li><a class="dl-reviews-link" href="/recensioni/">Recensioni</a></li>';
    if (list.includes('dl-nav-link')) {
      item = '<li><a class="dl-nav-link toggleColour text-white inline-block py-2 px-3" href="/recensioni/">Recensioni</a></li>';
    } else if (list.includes('font-size:1.05rem')) {
      item = '<li style="border-bottom:1px solid #e5f0ea"><a href="/recensioni/" style="display:block;padding:.9rem 0;color:#18212e;font-weight:600;text-decoration:none;font-size:1.05rem">Recensioni</a></li>';
    }

    return list.replace(/\s*<\/ul>$/, `\n        ${item}\n      </ul>`);
  });
}

let changed = 0;
for (const file of files) {
  const path = resolve(projectDir, file);
  const original = readFileSync(path, 'utf8');
  let html = original;

  html = html.replace(/<html lang="it_IT">/g, '<html lang="it">');
  html = html.replace(/^\s*<meta name="keywords"[^>]*>\s*\n/gm, '');
  html = html.replace(/^\s*<meta name="title"[^>]*>\s*\n/gm, '');
  html = html.replace(/<li><a href="\/recensioni\/">Recensioni<\/a><\/li>/g, '<li><a class="dl-reviews-link" href="/recensioni/">Recensioni</a></li>');
  html = html.replace(/https:\/\/unpkg\.com\/tailwindcss@2\.2\.19\/dist\/tailwind\.min\.css/g, '/assets/css/tailwind.min.css');
  html = html.replace(/<link rel="shortcut icon" href="[^"]*assets\/images\/webp\/logo-new\.webp">/g, '<link rel="icon" type="image/webp" href="/assets/images/webp/logo-100.webp">');
  html = html.replace(
    /<img style="width:2\.1rem;" src="[^"]*assets\/images\/webp\/logo-new\.webp" alt="logo dimagrimento lento"\s*\/?>/g,
    '<img style="width:2.1rem;height:auto" src="/assets/images/optimized/logo-96.webp" width="96" height="63" alt="Dimagrimento Lento">'
  );
  html = addReviewsLinks(html);

  const meta = metadata[file];
  if (meta) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${meta.description}">`);
  }

  if (file.startsWith('recensioni/')) {
    html = html.replace(/class="dl-nav-link active toggleColour inline-block py-2 px-3" href="\/testimonianze\.html"(?: aria-current="page")?/, 'class="dl-nav-link toggleColour text-white inline-block py-2 px-3" href="/testimonianze.html"');
    html = html.replace(/class="dl-nav-link toggleColour text-white inline-block py-2 px-3" href="\/recensioni\/">Recensioni<\/a>/, 'class="dl-nav-link active toggleColour inline-block py-2 px-3" href="/recensioni/" aria-current="page">Recensioni</a>');
    if (file !== 'recensioni/index.html') {
      html = html.replace(/href="\/testimonianze\.html#trustpilot"([^>]*)>← Torna alle recensioni/g, 'href="/recensioni/"$1>← Torna alle recensioni');
    }
  }

  if (file.startsWith('videotestimonianze/') && !html.includes('"@type": "BreadcrumbList"')) {
    const pageTitle = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.split('|')[0].trim() || 'Videotestimonianza';
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    if (canonical) {
      const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dimagrimentolento.it/' },
          { '@type': 'ListItem', position: 2, name: 'Testimonianze', item: 'https://dimagrimentolento.it/testimonianze.html' },
          { '@type': 'ListItem', position: 3, name: pageTitle, item: canonical }
        ]
      };
      html = html.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(breadcrumb, null, 2)}\n  </script>\n</head>`);
      html = html.replace(
        '<div class="container px-4 mx-auto">',
        '<div class="container px-4 mx-auto">\n      <nav aria-label="Breadcrumb" class="text-sm mb-8" style="color:rgba(255,255,255,.82)"><a href="/" style="color:inherit">Home</a> <span aria-hidden="true">›</span> <a href="/testimonianze.html" style="color:inherit">Testimonianze</a> <span aria-hidden="true">›</span> <span aria-current="page">Storia</span></nav>'
      );
    }
  }

  if (html !== original) {
    writeFileSync(path, html);
    changed += 1;
  }
}

console.log(`Migrazione SEO applicata a ${changed} file HTML.`);
