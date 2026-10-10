import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const trackedHtml = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.html'], { cwd: projectDir, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);
const sitemap = readFileSync(resolve(projectDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const errors = [];
const warnings = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();
const htmlByFile = new Map(trackedHtml.map((file) => [file, readFileSync(resolve(projectDir, file), 'utf8')]));
const idsByFile = new Map([...htmlByFile].map(([file, html]) => [file,
  new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]))
]));
const linkedPages = new Map();
const reviewData = JSON.parse(readFileSync(resolve(projectDir, 'assets/reviews.json'), 'utf8'));

function urlToFile(url) {
  const path = new URL(url).pathname;
  if (path === '/') return 'index.html';
  if (path.endsWith('/')) return path.slice(1) + 'index.html';
  if (!extname(path) && existsSync(resolve(projectDir, path.slice(1) + '.html'))) return path.slice(1) + '.html';
  return path.slice(1);
}

function stripMarkup(value) {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function localTarget(sourceFile, href) {
  if (!href || /^(?:mailto:|tel:|javascript:|data:|#)/.test(href)) return null;
  if (/^(?:https?:|\/\/)/.test(href)) {
    const url = new URL(href, 'https://dimagrimentolento.it');
    if (!['dimagrimentolento.it', 'www.dimagrimentolento.it'].includes(url.hostname)) return null;
    href = url.pathname + url.search + url.hash;
  }
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (clean === '/') return 'index.html';
  const relative = clean.startsWith('/') ? clean.slice(1) : resolve(projectDir, dirname(sourceFile), clean).slice(projectDir.length + 1);
  if (relative.endsWith('/')) return relative + 'index.html';
  if (!extname(relative)) {
    if (existsSync(resolve(projectDir, relative))) return relative;
    if (existsSync(resolve(projectDir, relative + '.html'))) return relative + '.html';
  }
  return relative;
}

function checkResource(file, href) {
  const target = localTarget(file, href);
  if (target && !existsSync(resolve(projectDir, target))) {
    errors.push(`${file}: risorsa interna mancante ${href}`);
  }
  return target;
}

function checkStructuredData(file, node) {
  if (!node || typeof node !== 'object') return;
  const types = [].concat(node['@type'] || []);
  // Recensioni della propria attività, anche importate da Trustpilot, non
  // sono idonee alle stelline Google: mantenere le recensioni visibili senza
  // Review/AggregateRating. https://developers.google.com/search/docs/appearance/structured-data/review-snippet
  if (types.some((type) => ['Review', 'AggregateRating'].includes(type))) {
    errors.push(`${file}: markup recensioni della propria attività non idoneo a Google`);
  }
  if (types.includes('DietNutrition')) {
    errors.push(`${file}: DietNutrition è una specialità medica, non un tipo di attività`);
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => checkStructuredData(file, item));
    else if (value && typeof value === 'object') checkStructuredData(file, value);
  }
}

for (const url of sitemapUrls) {
  const file = urlToFile(url);
  const path = resolve(projectDir, file);
  if (!existsSync(path)) {
    errors.push(`Sitemap: file mancante per ${url} (${file})`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)">/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!title) errors.push(`${file}: title mancante`);
  if (!description) errors.push(`${file}: meta description mancante`);
  if (canonical !== url) errors.push(`${file}: canonical ${canonical || 'mancante'} != ${url}`);
  if (h1Count !== 1) errors.push(`${file}: trovati ${h1Count} H1`);
  for (const [label, value, seen] of [
    ['title', title && stripMarkup(title), seenTitles],
    ['description', description, seenDescriptions],
    ['canonical', canonical, seenCanonicals]
  ]) {
    if (!value) continue;
    if (seen.has(value)) errors.push(`${file}: ${label} duplicato con ${seen.get(value)}`);
    else seen.set(value, file);
  }
  if (title && stripMarkup(title).length > 70) warnings.push(`${file}: title lungo (${stripMarkup(title).length})`);
  if (description && description.length > 170) warnings.push(`${file}: description lunga (${description.length})`);
}

for (const file of trackedHtml) {
  const html = htmlByFile.get(file);
  if (/<html lang="it_IT">/.test(html)) errors.push(`${file}: lang non BCP47`);
  if (/<meta name="keywords"/.test(html)) errors.push(`${file}: meta keywords legacy`);
  if (/unpkg\.com\/tailwindcss/.test(html)) errors.push(`${file}: Tailwind CDN ancora presente`);
  if (/\bitemtype=["'][^"']*schema\.org\/(?:Review|AggregateRating)["']/i.test(html)) {
    errors.push(`${file}: microdata recensioni della propria attività non idoneo a Google`);
  }

  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      checkStructuredData(file, JSON.parse(match[1]));
    } catch (error) {
      errors.push(`${file}: JSON-LD non valido (${error.message})`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    checkResource(file, match[1]);
  }

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  for (const id of new Set(ids)) {
    if (ids.filter((value) => value === id).length > 1) errors.push(`${file}: id duplicato ${id}`);
  }
  for (const match of html.matchAll(/\baria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) {
      if (!idsByFile.get(file).has(id)) errors.push(`${file}: riferimento ARIA mancante ${id}`);
    }
  }
  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const href = match[1];
    const target = href.startsWith('#') ? file : localTarget(file, href);
    if (target && htmlByFile.has(target)) {
      links.add(target);
      const fragment = href.split('#')[1];
      if (fragment && !idsByFile.get(target).has(decodeURIComponent(fragment))) {
        errors.push(`${file}: ancora interna mancante ${href}`);
      }
    }
    if (/^https:\/\/wa\.me\/(?!393516793334(?:\?|$))/.test(href)) {
      errors.push(`${file}: link WhatsApp senza numero internazionale dello studio ${href}`);
    }
  }
  linkedPages.set(file, links);

  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) checkResource(file, candidate.trim().split(/\s+/)[0]);
  }
  for (const match of html.matchAll(/<meta\b[^>]*(?:property="og:image"|name="twitter:image")[^>]*content="([^"]+)"/g)) {
    checkResource(file, match[1]);
  }
  for (const match of html.matchAll(/"reviewCount"\s*:\s*"?(\d+)"?/g)) {
    if (Number(match[1]) !== reviewData.meta.total_reviews) {
      errors.push(`${file}: totale Trustpilot non allineato ai metadati delle recensioni`);
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (/facebook\.com\/tr/.test(attrs)) continue;
    if (!/\balt="[^"]*"/.test(attrs)) errors.push(`${file}: immagine senza alt`);
    if (!/\bwidth="\d+"/.test(attrs) || !/\bheight="\d+"/.test(attrs)) {
      warnings.push(`${file}: immagine senza width/height`);
    }
  }
}

const reachable = new Set(['index.html']);
const queue = ['index.html'];
while (queue.length) {
  for (const file of linkedPages.get(queue.shift()) || []) {
    if (!reachable.has(file)) { reachable.add(file); queue.push(file); }
  }
}
for (const url of sitemapUrls) {
  if (!reachable.has(urlToFile(url))) errors.push(`Sitemap: pagina non raggiungibile tramite link HTML dalla home ${url}`);
}
if (reviewData.meta.archive_reviews !== reviewData.reviews.length) errors.push('reviews.json: numero recensioni in archivio non coerente');
if (reviewData.meta.total_reviews < reviewData.reviews.length) errors.push('reviews.json: totale pubblico inferiore alla selezione locale');

const testimonialJs = readFileSync(resolve(projectDir, 'assets/js/testimonianze.js'), 'utf8');
const reviewJs = readFileSync(resolve(projectDir, 'assets/js/tp-reviews.js'), 'utf8');
if (/application\/ld\+json/.test(testimonialJs)) errors.push('testimonianze.js: JSON-LD dinamico ancora presente');
if (/schema\.org\/Review|itemprop="reviewBody"/.test(reviewJs)) errors.push('tp-reviews.js: microdata Review incompleto ancora presente');
if (sitemapUrls.length === 0) errors.push('sitemap.xml: nessuna URL presente');
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push('sitemap.xml: URL duplicate');
if (/<(?:changefreq|priority)>/.test(sitemap)) errors.push('sitemap.xml: changefreq/priority non rimossi');

console.log(`SEO audit: ${sitemapUrls.length} URL sitemap, ${trackedHtml.length} file HTML.`);
for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Risultato: ${errors.length} errori, ${warnings.length} avvisi.`);
process.exitCode = errors.length ? 1 : 0;
