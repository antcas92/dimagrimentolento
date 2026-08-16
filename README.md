# dimagrimentolento.it

Sito statico di Dimagrimento Lento, pubblicato tramite GitHub Pages.

## Comandi di manutenzione

Richiede Node.js per l'audit/build CSS e `cwebp` per rigenerare le immagini responsive.

```bash
npm install
npm run build:css
npm run audit:seo
npm run optimize:images
```

Il file `assets/css/tailwind.min.css` è una build Tailwind 2.2.19 purgata sulle classi realmente presenti negli HTML e negli script. Va rigenerato quando vengono introdotte nuove utility Tailwind.

Lo script `scripts/seo-audit.mjs` controlla le 18 URL in sitemap, canonical, title, description, H1, JSON-LD, link/asset locali, immagini, lingua e dipendenze SEO legacy.

## Regole SEO del progetto

- URL canoniche: HTTPS, host apex `dimagrimentolento.it` e percorsi presenti in `sitemap.xml`.
- Le pagine strategiche devono essere raggiungibili tramite link HTML, non soltanto tramite JavaScript.
- Il JSON-LD deve essere prodotto con oggetti serializzati tramite `JSON.stringify`, mai concatenando testo non sanificato.
- Le immagini sotto la piega devono avere dimensioni esplicite e `loading="lazy"`; l'immagine LCP deve restare eager.
- Aggiornare `lastmod` nella sitemap soltanto quando cambia il contenuto della pagina.
