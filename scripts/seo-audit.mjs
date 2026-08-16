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

function urlToFile(url) {
  const path = new URL(url).pathname;
  if (path === '/') return 'index.html';
  if (path.endsWith('/')) return path.slice(1) + 'index.html';
  return path.slice(1);
}

function stripMarkup(value) {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function localTarget(sourceFile, href) {
  if (!href || /^(?:https?:|mailto:|tel:|javascript:|#|\/\/)/.test(href)) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  const relative = clean.startsWith('/') ? clean.slice(1) : resolve(dirname(sourceFile), clean).slice(projectDir.length + 1);
  if (relative.endsWith('/')) return relative + 'index.html';
  if (!extname(relative)) {
    if (existsSync(resolve(projectDir, relative))) return relative;
    if (existsSync(resolve(projectDir, relative + '.html'))) return relative + '.html';
  }
  return relative;
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
  const html = readFileSync(resolve(projectDir, file), 'utf8');
  if (/<html lang="it_IT">/.test(html)) errors.push(`${file}: lang non BCP47`);
  if (/<meta name="keywords"/.test(html)) errors.push(`${file}: meta keywords legacy`);
  if (/unpkg\.com\/tailwindcss/.test(html)) errors.push(`${file}: Tailwind CDN ancora presente`);

  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${file}: JSON-LD non valido (${error.message})`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = localTarget(file, match[1]);
    if (target && !existsSync(resolve(projectDir, target))) {
      errors.push(`${file}: risorsa interna mancante ${match[1]}`);
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

const testimonialJs = readFileSync(resolve(projectDir, 'assets/js/testimonianze.js'), 'utf8');
const reviewJs = readFileSync(resolve(projectDir, 'assets/js/tp-reviews.js'), 'utf8');
if (/application\/ld\+json/.test(testimonialJs)) errors.push('testimonianze.js: JSON-LD dinamico ancora presente');
if (/schema\.org\/Review|itemprop="reviewBody"/.test(reviewJs)) errors.push('tp-reviews.js: microdata Review incompleto ancora presente');
if (sitemapUrls.length !== 18) errors.push(`sitemap.xml: attese 18 URL, trovate ${sitemapUrls.length}`);
if (/<(?:changefreq|priority)>/.test(sitemap)) errors.push('sitemap.xml: changefreq/priority non rimossi');

console.log(`SEO audit: ${sitemapUrls.length} URL sitemap, ${trackedHtml.length} file HTML.`);
for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Risultato: ${errors.length} errori, ${warnings.length} avvisi.`);
process.exitCode = errors.length ? 1 : 0;
